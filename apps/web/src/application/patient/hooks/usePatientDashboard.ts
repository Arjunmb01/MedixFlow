import { useState, useEffect } from "react";
import { getDashboardStats } from "@/infrastructure/api/patient.api";

export interface PatientDashboardStats {
    upcomingAppointmentsCount?: number;
    nextAppointment?: {
        id: string;
        date: string;
        slotStart: string;
        doctorName: string;
        specialty: string;
    } | null;
    recentAppointments?: Array<{
        id: string;
        doctorName: string;
        specialty: string;
        date: string;
        status: string;
    }>;
    profileCompletion?: number;
    medicalRecordsCount?: number;
}

export const usePatientDashboard = () => {
    const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  return {
    stats,
    loading,
    refresh: fetchDashboardData,
  };
};
