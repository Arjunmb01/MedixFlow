export interface EmergencyContact {
  id?: string
  name: string
  mobile: string
}

export interface PatientProfile {

  id: string
  patientId: string

  name: string
  email: string
  mobile: string
  bloodGroup?: string
  gender?: string

  profileCompletion: number

  emergencyContacts: EmergencyContact[]
}