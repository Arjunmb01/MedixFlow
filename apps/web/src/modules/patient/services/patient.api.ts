import axios from "@/core/api/axios";

import type { PatientProfile, EmergencyContact } from "../types/patient.types";

export const getPatientProfile = async (): Promise<PatientProfile> => {
  const { data } = await axios.get("/patient/profile");
  return data;
};

export const updatePatientProfile = async (payload: {
  name: string;
  mobile: string;
  bloodGroup?: string;
}) => {

  const { data } = await axios.put("/patient/profile", payload);

  return data;
};

export const updateEmergencyContacts = async (
  contacts: EmergencyContact[]
) => {

  const { data } = await axios.put("/patient/emergency-contact", {
    contacts
  });

  return data;
};

export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {

  const { data } = await axios.put("/patient/password", payload);

  return data;
};