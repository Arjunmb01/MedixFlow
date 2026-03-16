import { OAuth2Client } from "google-auth-library";
import authRepository from "../repositories/auth.repository";
import tokenService from "../services/token.service";
import sessionService from "../services/session.service";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GoogleAuthUseCase {
  async execute(idToken: string) {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }

    const { email, given_name, family_name } = payload;

    // Check if user already exists
    let user = await authRepository.findUserByEmail(email);

    if (!user) {
      // Auto-register new Google user
      user = await authRepository.createGooglePatient({
        email,
        firstName: given_name || "User",
        lastName: family_name || "",
      });
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id, user.role);
    const refreshToken = tokenService.generateRefreshToken(user.id, user.role);

    await sessionService.saveSession(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}

export default new GoogleAuthUseCase();
