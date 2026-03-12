import tokenService from "../services/token.service";
import sessionService from "../services/session.service";

class RefreshTokenUseCase {

  async execute(refreshToken: string) {

    if (!refreshToken) {
      throw new Error("Refresh token required");
    }

    // Verify refresh token
    const payload: any = tokenService.verifyRefreshToken(refreshToken);

    const userId = payload.userId;

    // Check session in Redis
    const storedToken = await sessionService.getSession(userId);

    if (!storedToken) {
      throw new Error("Session expired");
    }

    if (storedToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }


    const accessToken = tokenService.generateAccessToken(
      payload.userId,
      payload.role
    );

    return {
      accessToken
    };

  }

}

export default new RefreshTokenUseCase();