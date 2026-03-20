import { useState, useEffect } from "react";
import { getDoctorProfileById } from "@/infrastructure/api/doctor.api";
import type { DoctorProfile } from "@/domain/doctor/types/doctor.types";

export const useDoctorDetails = (id: string) => {
    const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchDoctor = async () => {
            setLoading(true);
            try {
                const data = await getDoctorProfileById(id);
                setDoctor(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to fetch doctor details");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    return { doctor, loading, error };
};
