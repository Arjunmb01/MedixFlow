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
    return data as SlotInfo[];
};

export const bookAppointment = async (payload: BookAppointmentPayload) => {
    const { data } = await axios.post(`${API_BASE}/appointments`, payload);
    return data;
};
