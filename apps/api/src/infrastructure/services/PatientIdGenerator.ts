import { PrismaClient } from "@prisma/client";

export class PatientIdGenerator {
  constructor(private readonly prisma: PrismaClient) {}

  async generate(): Promise<string> {
    const totalPatients = await this.prisma.patientProfile.count();
    const nextIdNumber = totalPatients + 1;
    const paddedNumber = nextIdNumber.toString().padStart(4, '0');
    return `PX-${paddedNumber}`;
  }
}
