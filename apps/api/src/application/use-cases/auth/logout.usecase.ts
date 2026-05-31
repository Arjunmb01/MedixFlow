import { MESSAGES } from "@/shared/constants";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class LogoutUseCase {
  constructor(private sessionService: ISessionService) {}

  async execute(userId: string, role: UserRole) {
    if (!userId) {
      throw new Error(MESSAGES.USER_ID_REQUIRED);
    }

    await this.sessionService.deleteSession(userId, role);

    return {
      message: MESSAGES.LOGOUT_SUCCESS
    };
  }
}

