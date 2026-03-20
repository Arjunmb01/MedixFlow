import { useState, useCallback } from "react";
import { getAllPatients, deletePatient, updatePatientStatus } from "@/infrastructure/api/patient.api";
import type { PatientProfile } from "@/domain/patient/types/patient.types";
import { toast } from "sonner";

export const usePatientManagement = () => {
    const [patients, setPatients] = useState<PatientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const fetchPatients = useCallback(async (filters: any) => {
        try {
            setLoading(true);
            const response = await getAllPatients(filters);
            setPatients(response.data);
            setStats(response.meta);
        } catch (error) {
            console.error("Failed to fetch patients", error);
            toast.error("Failed to load patient directory");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDeletePatient = async (id: string) => {
        try {
            await deletePatient(id);
            toast.success("Patient deleted successfully");
            return true;
        } catch (error) {
            toast.error("Failed to delete patient");
            return false;
        }
    };

    const handleUpdatePatientStatus = async (id: string, status: string) => {
        try {
            await updatePatientStatus(id, status);
            toast.success(`Patient account ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
            return true;
        } catch (error) {
            toast.error("Failed to update patient status");
            return false;
        }
    };

    return {
        patients,
        loading,
        stats,
        fetchPatients,
        handleDeletePatient,
        handleUpdatePatientStatus
    };
};
