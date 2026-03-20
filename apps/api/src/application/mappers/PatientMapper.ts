export class PatientMapper {
  static toProfile(patient: any, completion?: number) {
    if (!patient) return null;
    
    return {
      id: patient.id,
      patientId: patient.patientId,
      name: `${patient.firstName} ${patient.lastName}`.trim(),
      email: patient.user?.email || "",
      mobile: patient.phone || "",
      bloodGroup: patient.bloodGroup,
      gender: patient.gender,
      profileCompletion: completion ?? 0,
      emergencyContacts: patient.emergencyContacts || [],
      user: patient.user
    };
  }
}
