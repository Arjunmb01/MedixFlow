import { useState, useEffect, useCallback } from "react";
import { getDoctorProfile, getDoctorDashboardStats } from "@/infrastructure/api/doctor.api";
import type { DoctorProfile } from "@/domain/doctor/types/doctor.types";

interface DashboardStats {
    totalAppointments: number;
    todayAppointmentsCount: number;
    completedToday: number;
    pendingToday: number;
    todayAppointments: any[];
}

export const useDoctorDashboard = () => {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [prof, st] = await Promise.all([
                getDoctorProfile(),
                getDoctorDashboardStats()
            ]);
            setProfile(prof);
            setStats(st);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        profile,
        stats,
        loading,
        fetchDashboardData
    };
};
