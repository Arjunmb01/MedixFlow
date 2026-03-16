import { PatientProfile } from "../types/patient.types"

export function calculateProfileCompletion(
  patient: PatientProfile
): number {

  const fields = [
    patient.name,
    patient.email,
    patient.mobile,
    patient.bloodGroup
  ]

  const filled = fields.filter(Boolean).length

  const emergencyCompleted =
    patient.emergencyContacts.length > 0 ? 1 : 0

  const totalFields = fields.length + 1

  const completed = filled + emergencyCompleted

  return Math.round((completed / totalFields) * 100)
}