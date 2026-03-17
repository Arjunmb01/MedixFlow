export interface PatientProfile {
  id: string
  patientId: string
  name: string
  email: string
  mobile: string
  bloodGroup?: string | null
  gender?: string | null
  emergencyContacts: EmergencyContact[]
}

export interface EmergencyContact {
  id: string
  name: string
  mobile: string
}

export interface UpdatePatientInput {
  name: string
  mobile: string
  bloodGroup?: string
  gender?: string
}

export interface EmergencyContactInput {
  name: string
  mobile: string
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
}