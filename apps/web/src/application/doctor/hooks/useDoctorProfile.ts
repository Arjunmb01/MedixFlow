import { useState, useEffect, useCallback } from "react";
import { getDoctorProfile, updateDoctorProfile, updateDoctorPassword, getDoctorDashboardStats, updateDoctorSchedules } from "@/infrastructure/api/doctor.api";
import type { DoctorProfile, DoctorSchedule } from "@/domain/doctor/types/doctor.types";
import { toast } from "sonner";

const DAYS = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
];

export const useDoctorProfile = () => {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [personalInfo, setPersonalInfo] = useState({
        firstName: "",
        lastName: "",
        specialty: "",
        consultationFee: 0,
        licenseNumber: "",
        phone: "",
        bio: "",
        avatarUrl: ""
    });
    const [schedules, setSchedules] = useState<(DoctorSchedule & { active: boolean })[]>([]);

    const fetchProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getDoctorProfile();
            setProfile(data);
            setPersonalInfo({
                firstName: data.firstName,
                lastName: data.lastName,
                specialty: data.specialty,
                consultationFee: data.consultationFee,
                licenseNumber: data.licenseNumber,
                phone: data.phone || "",
                bio: data.bio || "",
                avatarUrl: data.avatarUrl || ""
            });

            const existingSchedules = (data as any).schedules || [];
            const fullSchedules = DAYS.map(day => {
                const found = existingSchedules.find((s: any) => s.dayOfWeek === day.value);
                return {
                    dayOfWeek: day.value,
                    active: !!found,
                    startTime: found?.startTime || "09:00",
                    endTime: found?.endTime || "17:00",
                    fullDay: found?.fullDay || false,
                    slotDurationMinutes: found?.slotDurationMinutes || 30
                };
            });
            setSchedules(fullSchedules);

            try {
                const dashboardStats = await getDoctorDashboardStats();
                setStats(dashboardStats);
            } catch (statsError) {
                console.error("Failed to fetch dashboard stats", statsError);
            }
        } catch (error) {
            console.error("Failed to fetch doctor profile", error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleUpdateProfile = async (data: Partial<DoctorProfile>) => {
        try {
            setSaving(true);
            const updatedProfile = await updateDoctorProfile(data);
            setProfile(updatedProfile);
            toast.success("Profile updated successfully");
            await fetchProfileData();
            return updatedProfile;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (data: any) => {
        try {
            setSaving(true);
            const result = await updateDoctorPassword(data);
            toast.success("Password updated successfully");
            return result;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update password");
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSchedules = async (newSchedules: any[]) => {
        try {
            setSaving(true);
            const activeSchedules = newSchedules
                .filter(s => s.active)
                .map(s => ({
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    fullDay: s.fullDay,
                    slotDurationMinutes: s.slotDurationMinutes
                }));
            
            await updateDoctorSchedules(activeSchedules);
            toast.success("Schedules updated successfully");
            await fetchProfileData();
        } catch (error: any) {
            toast.error("Failed to update schedules");
            throw error;
        } finally {
            setSaving(false);
        }
    };

    return {
        profile,
        stats,
        loading,
        saving,
        personalInfo,
        setPersonalInfo,
        schedules,
        setSchedules,
        handleUpdateProfile,
        handleUpdatePassword,
        handleUpdateSchedules,
        fetchProfile: fetchProfileData
    };
};
