import { OAuth2Client } from "google-auth-library";
import { IGoogleAuthService, GoogleUser } from "@/application/interfaces/IGoogleAuthService";
import { env as config } from "@/shared/config/env";
import { MESSAGES } from "@/shared/constants";

export class GoogleAuthService implements IGoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
  }

  async verifyToken(idToken: string): Promise<GoogleUser> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error(MESSAGES.INVALID_GOOGLE_TOKEN);
    }

    return {
      email: payload.email,
      firstName: payload.given_name || "User",
      lastName: payload.family_name || "",
    };
  }
}

