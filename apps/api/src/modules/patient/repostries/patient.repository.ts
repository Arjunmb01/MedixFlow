import { prisma } from "../../../infrastructure/database/prismaClient"
import {
  EmergencyContactInput,
  UpdatePatientInput
} from "../types/patient.types"

export class PatientRepository {

  async findById(id: string) {

    return prisma.patientProfile.findUnique({
      where: { id },
      include: { 
        emergencyContacts: true,
        user: true
      }
    })
  }

  async updatePatient(
    id: string,
    data: UpdatePatientInput
  ) {
    const nameParts = data.name.trim().split(/\s+/)
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ")

    return prisma.patientProfile.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone: data.mobile,
        bloodGroup: data.bloodGroup
      }
    })
  }

  async updatePassword(
    id: string,
    passwordHash: string
  ) {

    return prisma.user.update({
      where: { id },
      data: { passwordHash }
    })
  }

  async replaceEmergencyContacts(
    patientId: string,
    contacts: EmergencyContactInput[]
  ) {

    await prisma.emergencyContact.deleteMany({
      where: { patientId }
    })

    return prisma.emergencyContact.createMany({
      data: contacts.map(c => ({
        ...c,
        patientId
      }))
    })
  }
}