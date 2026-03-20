import { UserStatus } from "@prisma/client";

export class Doctor {
  constructor(
    public readonly id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public status: UserStatus,
    public specialty: string,
    public consultationFee: number,
    public licenseNumber: string,
    public phone?: string
  ) {}

  public updateProfile(data: { firstName?: string; lastName?: string; specialty?: string; consultationFee?: number; phone?: string; licenseNumber?: string }): void {
    if (data.firstName !== undefined) {
      if (!data.firstName.trim()) throw new Error("First name cannot be empty");
      this.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      if (!data.lastName.trim()) throw new Error("Last name cannot be empty");
      this.lastName = data.lastName;
    }
    if (data.specialty) this.specialty = data.specialty;
    if (data.consultationFee !== undefined) {
      if (data.consultationFee < 0) throw new Error("Consultation fee cannot be negative");
      this.consultationFee = data.consultationFee;
    }
    if (data.phone) this.phone = data.phone;
    if (data.licenseNumber) this.licenseNumber = data.licenseNumber;
  }

  public validateStatus(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public updateFee(newFee: number): void {
    if (newFee < 0) throw new Error("Consultation fee cannot be negative");
    this.consultationFee = newFee;
  }
}
