import { UserStatus } from "../value-objects/enums/UserStatus";
import { Gender } from "../value-objects/enums/Gender";
import { UserRole } from "../value-objects/enums/UserRole";

export class Patient {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public status: UserStatus,
    public phone?: string,
    public bloodGroup?: string,
    public gender?: Gender,
    public passwordHash?: string,
    public role: UserRole = UserRole.PATIENT,
    public emergencyContacts: { id?: string; name: string; mobile: string; }[] = [],
    public readonly wallet?: { id: string; balance: number }
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
