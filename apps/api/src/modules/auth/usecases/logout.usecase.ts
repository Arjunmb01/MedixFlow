import { MESSAGES } from "../../../core/constants";
import { ISessionService } from "../interfaces/ISessionService";

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