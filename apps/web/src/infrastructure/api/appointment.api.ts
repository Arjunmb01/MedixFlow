import api from "../../core/api/axios";
import type { SlotInfo } from "@/modules/patient/components/booking/SlotPicker";

export interface BookAppointmentPayload {
    patientId: string;
    doctorId: string;
    date: string; 
    slotStart: string;
    slotEnd: string;
    paymentMethod?: "RAZORPAY" | "WALLET" | "STRIPE" | "PAYPAL";
    useWallet?: boolean;
}

export const getAvailableSlots = async (
    doctorId: string,
    date: Date
): Promise<SlotInfo[]> => {
    if (!doctorId) {
        console.error("getAvailableSlots: doctorId is required");
        throw new Error("Doctor ID is required to fetch slots.");
    }
    if (!date) {
        console.error("getAvailableSlots: date is required");
        throw new Error("Date is required to fetch slots.");
    }

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
            capacity: 1,
            booked: slot.available ? 0 : 1,
            available: slot.available ? 1 : 0,
            isFull: !slot.available,
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

export const getFinancialActivity = async (params?: any) => {
    const { data } = await api.get("/patient/wallet/activity", { params });
    return data;
};

export const checkRescheduleConflict = async (params: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    newDate: string;
    slotStart: string;
    slotEnd: string;
}) => {
    const { data } = await api.get("/appointments/check-conflict", { params });
    return data.data;
};
export const getAppointmentById = async (id: string) => {
    const { data } = await api.get(`/appointments/${id}`);
    return data.data;
};
