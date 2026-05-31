import { UserRole } from "../../domain/value-objects/enums/UserRole";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: UserRole;
        email?: string;
<<<<<<< HEAD
=======
        sessionId: string;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
      };
    }
  }
}

export {};

