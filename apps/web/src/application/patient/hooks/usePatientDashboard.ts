import { useState, useEffect } from "react";
import { getDashboardStats, getUpcomingAppointments } from "@/infrastructure/api/patient.api";

export const usePatientDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [statsData, appointmentsData] = await Promise.all([
                getDashboardStats(),
                getUpcomingAppointments()
            ]);
            setStats(statsData);
            setUpcomingAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        stats,
        upcomingAppointments,
        loading,
        refresh: fetchDashboardData
    };
};
