import sessionService from "../services/session.service";

class LogoutUseCase {
    async execute(userId: string) {

    if (!userId) {
      throw new Error("User ID required");
    }

    await sessionService.deleteSession(userId);

    return {
      message: "Logout successful"
    };

  }

}

export default new LogoutUseCase();