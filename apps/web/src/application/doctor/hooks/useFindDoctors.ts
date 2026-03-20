import { useState, useEffect, useCallback } from "react";
import { getDoctorsFiltered } from "@/infrastructure/api/doctor.api";
import type { DoctorProfile } from "@/domain/doctor/types/doctor.types";

// interface DoctorListResponse {
//     doctors: DoctorProfile[];
//     total: number;
// }

interface DoctorFilters {
    search: string;
    specialty: string;
    availableToday: boolean;
    minFee: number;
    maxFee: number;
    page: number;
    limit: number;
    [key: string]: any;
}

export const useFindDoctors = (initialFilters: Partial<DoctorFilters> = {}) => {
    const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<DoctorFilters>({
        search: "",
        specialty: "All",
        availableToday: false,
        minFee: 0,
        maxFee: 2000,
        page: 1,
        limit: 6,
        ...initialFilters
    });

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDoctorsFiltered(filters);
            setDoctors(data.doctors);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const updateFilters = (newFilters: Partial<DoctorFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
    };

    return {
        doctors,
        loading,
        total,
        filters,
        updateFilters,
        refresh: fetchDoctors
    };
};
