import { prisma } from "../../../infrastructure/database/prismaClient";

export class PatientIdGenerator {
  static async generate(): Promise<string> {
    const lastPatient = await prisma.patientProfile.findFirst({
      orderBy: {
        patientId: 'desc',
      },
      select: {
        patientId: true,
      },
    });

    if (!lastPatient || !lastPatient.patientId) {
      return 'PX-0001';
    }

    const lastIdNumber = parseInt(lastPatient.patientId.replace('PX-', ''), 10);
    const nextIdNumber = lastIdNumber + 1;
    const paddedNumber = nextIdNumber.toString().padStart(4, '0');

    return `PX-${paddedNumber}`;
  }
}
