import { useState, useEffect, useCallback } from "react";
import { getDoctors, createDoctor, updateStaffDoctor, blockDoctor, deleteDoctor } from "@/infrastructure/api/staff.api";
import type { DoctorProfile } from "@/domain/doctor/types/doctor.types";
import type { CreateDoctorPayload } from "@/domain/staff/types/staff.types";
import { toast } from "sonner";

export const useStaffManagement = () => {
    const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const fetchDoctors = useCallback(async (filters?: any) => {
        try {
            setLoading(true);
            const data = await getDoctors(filters);
            setDoctors(data.doctors || data); // Handle both wrapped and direct array
            setStats(data.stats);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
            toast.error("Failed to load doctor directory");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleCreateDoctor = async (data: CreateDoctorPayload) => {
        try {
            await createDoctor(data);
            toast.success("Doctor created and setup email sent!");
            await fetchDoctors();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create doctor");
            throw error;
        }
    };

    const handleUpdateDoctor = async (id: string, data: Partial<DoctorProfile>) => {
        try {
            await updateStaffDoctor(id, data);
            toast.success("Doctor profile updated");
            await fetchDoctors();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update doctor");
            throw error;
        }
    };

    const handleBlockDoctor = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
            await blockDoctor(id, newStatus);
            toast.success(`Doctor ${newStatus === 'SUSPENDED' ? 'suspended' : 'activated'} successfully`);
            await fetchDoctors();
        } catch (error: any) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteDoctor = async (id: string) => {
        try {
            await deleteDoctor(id);
            toast.success("Doctor deleted successfully");
            await fetchDoctors();
        } catch (error) {
            toast.error("Failed to delete doctor");
        }
    };

    return {
        doctors,
        loading,
        stats,
        fetchDoctors,
        handleCreateDoctor,
        handleUpdateDoctor,
        handleBlockDoctor,
        handleDeleteDoctor
    };
};
