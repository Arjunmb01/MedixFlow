import { Patient } from "@/domain/entities/Patient";
import { PatientProfile } from "@/domain/value-objects/types/patient.repository.types";

export class PatientMapper {
  static toProfile(patient: Patient, completion?: number): PatientProfile {
    if (!patient) return null as any;
    
    return {
      id: patient.id,
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      name: `${patient.firstName} ${patient.lastName}`,
      email: patient.email,
      phone: patient.phone || "",
      mobile: patient.phone || "",
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      status: patient.status,
      user: {
        id: patient.id,
        email: patient.email,
        status: patient.status,
        createdAt: new Date() 
      },
      createdAt: new Date(), 
      avatarUrl: "", 
      emergencyContacts: patient.emergencyContacts
    };
  }
}
