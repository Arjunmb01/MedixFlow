import { MESSAGES } from "@/shared/constants";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class LogoutUseCase {
  constructor(private sessionService: ISessionService) {}

<<<<<<< HEAD
  async execute(userId: string, role: UserRole) {
=======
  async execute(userId: string, role: UserRole, sessionId: string) {
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
    if (!userId) {
      throw new Error(MESSAGES.USER_ID_REQUIRED);
    }

<<<<<<< HEAD
    await this.sessionService.deleteSession(userId, role);
=======
    await this.sessionService.deleteSession(userId, role, sessionId);
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

    return {
      message: MESSAGES.LOGOUT_SUCCESS
    };
  }
}

