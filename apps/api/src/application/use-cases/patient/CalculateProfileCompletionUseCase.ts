import { Patient } from "@/domain/entities/Patient";

export class CalculateProfileCompletionUseCase {
  execute(patient: Patient | null): number {
    if (!patient) return 0;

    const fields = [
      patient.firstName,
      patient.lastName,
      patient.phone,
      patient.bloodGroup,
      patient.email
    ];
  
    const filled = fields.filter(f => f && typeof f === 'string' && f.trim() !== "").length;
  
    // For emergency contacts, since they are not in the main entity yet,
    // we'll assume they are handled separately.
    const hasEmergencyContacts = 1; 
  
    const totalFields = fields.length + 1; // fields + emergencyContacts
  
    const completedCount = filled + hasEmergencyContacts;
  
    return Math.round((completedCount / totalFields) * 100);
  }
}
