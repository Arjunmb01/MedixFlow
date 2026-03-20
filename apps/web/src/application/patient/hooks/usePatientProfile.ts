import { useState, useEffect } from "react";
import { getPatientProfile, updatePatientProfile, updateEmergencyContacts, updatePassword } from "@/infrastructure/api/patient.api";
import type { PatientProfile, EmergencyContact } from "@/domain/patient/types/patient.types";
import { toast } from "sonner";

export const usePatientProfile = () => {
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [personalInfo, setPersonalInfo] = useState({
        name: "",
        mobile: "",
        bloodGroup: "",
        gender: ""
    });
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
        { name: "", mobile: "" },
        { name: "", mobile: "" }
    ]);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getPatientProfile();
                setProfile(data);
                setPersonalInfo({
                    name: data.name,
                    mobile: data.mobile,
                    bloodGroup: data.bloodGroup || "",
                    gender: data.gender || ""
                });
                if (data.emergencyContacts?.length > 0) {
                    const contacts = [...data.emergencyContacts];
                    while (contacts.length < 2) contacts.push({ name: "", mobile: "" });
                    setEmergencyContacts(contacts);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updatePatientProfile({
                name: personalInfo.name,
                mobile: personalInfo.mobile,
                bloodGroup: personalInfo.bloodGroup || undefined,
                gender: personalInfo.gender || undefined
            });
            toast.success("Personal information updated successfully!");
        } catch (error) {
            toast.error("Failed to update personal information.");
        }
    };

    const handleEmergencySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateEmergencyContacts(emergencyContacts);
            toast.success("Emergency contacts updated successfully!");
        } catch (error) {
            toast.error("Failed to update emergency contacts.");
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        try {
            await updatePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success("Password updated successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error("Failed to update password. Please check your current password.");
        }
    };

    return {
        profile,
        personalInfo,
        setPersonalInfo,
        emergencyContacts,
        setEmergencyContacts,
        passwords,
        setPasswords,
        loading,
        handlePersonalInfoSubmit,
        handleEmergencySubmit,
        handlePasswordSubmit
    };
};
