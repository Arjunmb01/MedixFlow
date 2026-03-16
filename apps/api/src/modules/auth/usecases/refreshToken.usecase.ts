import tokenService from "../services/token.service";
import sessionService from "../services/session.service";

class RefreshTokenUseCase {

  async execute(refreshToken: string, expectedRole: string) {

    if (!refreshToken) {
      throw new Error("Refresh token required");
    }

    const payload: any = tokenService.verifyRefreshToken(refreshToken);

    const userId = payload.userId;
    const role = payload.role;

    if (role !== expectedRole) {
      throw new Error("Invalid session for this role");
    }

    const storedToken = await sessionService.getSession(userId);

    if (!storedToken) {
      throw new Error("Session expired");
    }

    if (storedToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }


    const accessToken = tokenService.generateAccessToken(
      userId,
      role
    );

    return {
      accessToken
    };

  }

}

export default new RefreshTokenUseCase();