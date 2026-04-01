import { UserStatus } from "../value-objects/enums/UserStatus";
import { Role } from "../value-objects/enums/Role";

/**
 * Domain User entity — pure TypeScript, zero infrastructure dependencies.
 * Used by IAuthRepository so the application layer never sees Prisma types.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: Role | string,
    public readonly status: UserStatus | string,
    public readonly passwordHash: string,
    public readonly createdAt?: Date
  ) {}

  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public isBlocked(): boolean {
    return (
      this.status === UserStatus.INACTIVE ||
      this.status === UserStatus.SUSPENDED
    );
  }
}
