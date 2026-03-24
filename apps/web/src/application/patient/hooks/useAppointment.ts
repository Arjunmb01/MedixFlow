import type { BookAppointmentPayload } from "@/domain/patient/types/patient.types";
import { bookAppointment, getAvailableSlots } from "@/infrastructure/api/patient.api";
import { useState } from "react"

export interface Slot {
    start : string;
    end : string;
}

export const useAppointment = () => {
    const [slots,setSlots] = useState<Slot[]>([])
    const [loading,setLoading] = useState(false)

    const fetchSlots = async (doctorId : string, date : string) => {
        setLoading(true);

        try {
            const data = await getAvailableSlots(doctorId,date);
            setSlots(data);
        } catch (error) {
            console.error("Error fetching slots: ",error)
        }finally{
            setLoading(false)
        }
    }

    const book  = async (payload : BookAppointmentPayload) => {
        try {
            return await bookAppointment(payload)
        } catch (error) {
            console.error("Booking failed : ",error)
            throw error
        }
    }

    return {
        slots,
        loading,
        fetchSlots,
        book
    }
}