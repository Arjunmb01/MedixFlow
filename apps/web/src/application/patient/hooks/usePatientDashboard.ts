import { useState, useEffect } from "react";
import { getDashboardStats, getUpcomingAppointments, getNotifications } from "@/infrastructure/api/patient.api";

export const usePatientDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [statsData, appointmentsData, notificationsData] = await Promise.all([
                getDashboardStats(),
                getUpcomingAppointments(),
                getNotifications()
            ]);
            setStats(statsData);
            setUpcomingAppointments(appointmentsData);
            setNotifications(notificationsData);
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
        notifications,
        loading,
        refresh: fetchDashboardData
    };
};
