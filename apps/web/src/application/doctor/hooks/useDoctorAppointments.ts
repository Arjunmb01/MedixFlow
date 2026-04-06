import { useState, useEffect } from "react";
import { getDoctorAppointments } from "@/infrastructure/api/doctor.api";
import { toast } from "sonner";
import type { Appointment } from "@/domain/appointment/types";

export const useDoctorAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await getDoctorAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch doctor appointments:", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return {
        appointments,
        loading,
        refreshAppointments: fetchAppointments
    };
};
