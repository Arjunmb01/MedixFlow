import { UserStatus } from "@prisma/client";

export class Patient {
  constructor(
    public readonly id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public status: UserStatus,
    public phone?: string,
    public bloodGroup?: string,
    public role: string = "PATIENT"
  ) {}

  public updateProfile(firstName: string, lastName: string, phone: string, bloodGroup: string): void {
    if (!firstName || !lastName || firstName.trim() === "" || lastName.trim() === "") {
      throw new Error("First name and last name are required");
    }
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.bloodGroup = bloodGroup;
  }

  public validateStatus(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public blockPatient(): void {
    this.status = UserStatus.SUSPENDED;
  }

  public activatePatient(): void {
    this.status = UserStatus.ACTIVE;
  }
}
