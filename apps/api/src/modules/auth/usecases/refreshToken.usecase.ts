import tokenService from "../services/token.service";
import sessionService from "../services/session.service";
import { prisma } from "../../../infrastructure/database/prismaClient";

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

    // Check if user is blocked/inactive
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
    if (!user || user.status === "INACTIVE" || user.status === "SUSPENDED") {
      await sessionService.deleteSession(userId);
      throw new Error("Account blocked");
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