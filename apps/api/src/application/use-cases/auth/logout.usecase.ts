import { MESSAGES } from "@/shared/constants";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class LogoutUseCase {
  constructor(private sessionService: ISessionService) {}

  async execute(userId: string, role: UserRole, sessionId: string) {
    if (!userId) {
      throw new Error(MESSAGES.USER_ID_REQUIRED);
    }

    await this.sessionService.deleteSession(userId, role, sessionId);

    return {
      message: MESSAGES.LOGOUT_SUCCESS
    };
  }
}

