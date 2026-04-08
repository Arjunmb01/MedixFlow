import { useState, useEffect } from "react";
import { getDoctorAppointments } from "@/infrastructure/api/doctor.api";
import { toast } from "sonner";
import type { Appointment } from "@/domain/appointment/types";

export const useDoctorAppointments = (filters: any = {}) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await getDoctorAppointments(filters);
            setAppointments(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to fetch doctor appointments:", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [JSON.stringify(filters)]);

    return {
        appointments,
        loading,
        meta,
        refreshAppointments: fetchAppointments
    };
};
