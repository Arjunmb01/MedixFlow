import { UserRole } from "../../domain/value-objects/enums/UserRole";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: UserRole;
        email?: string;
      };
    }
  }
}

export {};

