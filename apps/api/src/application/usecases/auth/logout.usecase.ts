import { MESSAGES } from "@/shared/constants";
import { ISessionService } from "@/domain/services/IAuthServices";

export class LogoutUseCase {
  constructor(private sessionService: ISessionService) {}

  async execute(userId: string) {
    if (!userId) {
      throw new Error(MESSAGES.USER_ID_REQUIRED);
    }

    await this.sessionService.deleteSession(userId);

    return {
      message: MESSAGES.LOGOUT_SUCCESS
    };
  }
}
