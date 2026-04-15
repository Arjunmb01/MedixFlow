import { UserStatus } from "../value-objects/enums/UserStatus";
import { UserRole } from "../value-objects/enums/UserRole";

/**
 * Domain User entity — pure TypeScript, zero infrastructure dependencies.
 * Used by IAuthRepository so the application layer never sees Prisma types.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly status: UserStatus,
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
