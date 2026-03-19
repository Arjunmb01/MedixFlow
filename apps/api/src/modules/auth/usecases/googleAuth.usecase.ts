import { OAuth2Client } from "google-auth-library";
import { MESSAGES } from "../../../core/constants";
import { config } from "../../../core/config";
import { IAuthRepository } from "../interfaces/IAuthRepository";
import tokenService from "../services/token.service";
import sessionService from "../services/session.service";

const client = new OAuth2Client(config.googleClientId);

export class GoogleAuthUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(idToken: string) {
    console.time("google_auth_total");
    
    // Verify the Google token
    console.time("google_verify");
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });
    console.timeEnd("google_verify");

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error(MESSAGES.INVALID_GOOGLE_TOKEN);
    }

    const { email, given_name, family_name } = payload;

    // Check if user already exists
    console.time("db_find_user");
    let user = await this.authRepository.findUserByEmail(email);
    console.timeEnd("db_find_user");

    if (user) {
      // If user exists and is not a patient, prevent login with helpful message
      if (user.role !== "PATIENT") {
        if (user.role === "DOCTOR") throw new Error("It looks like you have a Doctor account. Please login through the Doctor Portal.");
        if (user.role === "ADMIN") throw new Error("This is an Admin account. Please login through the Admin Portal.");
        throw new Error(MESSAGES.INVALID_ROLE_PATIENT);
      }
    } else {
      // Auto-register new Google user as PATIENT
      console.time("db_create_google_user");
      user = await this.authRepository.createGooglePatient({
        email,
        firstName: given_name || "User",
        lastName: family_name || "",
      });
      console.timeEnd("db_create_google_user");
    }

    // Check if user is blocked
    if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id, user.role, user.email);
    const refreshToken = tokenService.generateRefreshToken(user.id, user.role, user.email);

    console.time("session_save");
    await sessionService.saveSession(user.id, refreshToken);
    console.timeEnd("session_save");

    console.timeEnd("google_auth_total");
    return { accessToken, refreshToken };
  }
}
