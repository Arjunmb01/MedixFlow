import api from "../../core/api/axios";
import type { SlotInfo } from "@/modules/patient/components/booking/SlotPicker";

export interface BookAppointmentPayload {
    patientId: string;
    doctorId: string;
    date: string; 
    slotStart: string;
    slotEnd: string;
    paymentMethod?: "RAZORPAY" | "WALLET";
}

export const getAvailableSlots = async (
    doctorId: string,
    date: Date
): Promise<SlotInfo[]> => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const { data } = await api.get("/appointments/slots", {
        params: { doctorId, date: dateStr },
    });

    return (data as any[]).map((slot: any) => {
        const startDate = new Date(slot.startTime);
        const endDate = new Date(slot.endTime);
        const now = new Date();

        return {
            start: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
            end: `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`,
            capacity: slot.capacity,
            booked: slot.bookedCount,
            available: Math.max(0, slot.capacity - slot.bookedCount),
            isFull: slot.bookedCount >= slot.capacity,
            isPast: startDate < now && dateStr === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
        } as SlotInfo;
    });
};

export const bookAppointment = async (payload: BookAppointmentPayload) => {
    const { data } = await api.post("/appointments", payload);
    return data;
};

export const getWalletBalance = async () => {
    const { data } = await api.get("/patient/wallet/");
    return data;
};

export const topUpWallet = async (amount: number) => {
    const { data } = await api.post("/patient/wallet/top-up", { amount });
    return data;
};

export const verifyWalletTopUp = async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
}) => {
    const { data } = await api.post("/patient/wallet/verify", payload);
    return data;
};

export const getFinancialActivity = async () => {
    const { data } = await api.get("/patient/wallet/activity");
    return data;
};
