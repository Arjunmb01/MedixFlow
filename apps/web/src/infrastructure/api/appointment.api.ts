import axios from "axios";
import type { SlotInfo } from "@/modules/patient/components/booking/SlotPicker";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface BookAppointmentPayload {
    patientId: string;
    doctorId: string;
    date: string; 
    slotStart: string;
    slotEnd: string;
}

export const getAvailableSlots = async (
    doctorId: string,
    date: Date
): Promise<SlotInfo[]> => {
    // Determine local date without timezone offset shifts
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const { data } = await axios.get(`${API_BASE}/appointments/slots`, {
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
    const { data } = await axios.post(`${API_BASE}/appointments`, payload);
    return data;
};
