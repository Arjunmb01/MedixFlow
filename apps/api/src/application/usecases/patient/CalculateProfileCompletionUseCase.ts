export class CalculateProfileCompletionUseCase {
  execute(patient: any): number {
    const fields = [
      patient.firstName,
      patient.lastName,
      patient.phone,
      patient.bloodGroup
    ];
  
    const filled = fields.filter(Boolean).length;
    
    // Account for nested user email if necessary
    const email = patient.user?.email || "";
    const emailFilled = email ? 1 : 0;
  
    const emergencyCompleted =
      (patient.emergencyContacts && patient.emergencyContacts.length > 0) ? 1 : 0;
  
    const totalFields = fields.length + 1 + 1; // firstName, lastName, phone, bloodGroup, email, emergencyContacts
  
    const completed = filled + emailFilled + emergencyCompleted;
  
    return Math.round((completed / totalFields) * 100);
  }
}
