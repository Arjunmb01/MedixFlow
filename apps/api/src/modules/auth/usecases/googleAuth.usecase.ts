import { OAuth2Client } from 'google-auth-library';
import authRepository from '../repositories/auth.repository';
import tokenService from '../services/token.service';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleAuthData {
  credential: string;
}

class GoogleAuthUseCase {
  async execute(data: GoogleAuthData) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("Google Client ID is not configured on the server.");
    }

    const ticket = await client.verifyIdToken({
      idToken: data.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token payload");
    }

    const { email, given_name, family_name } = payload;

    let user = await authRepository.findUserByEmail(email);


    if (!user) {
      user = await authRepository.createPatient({
        email,
        passwordHash: "", 
        firstName: given_name || "Patient",
        lastName: family_name || "",
        phone: "", 
      });
    }


    const accessToken = tokenService.generateAccessToken(user.id, user.role);
    const refreshToken = tokenService.generateRefreshToken(user.id);

    return {
      message: "Successfully authenticated with Google",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    };
  }
}

export default new GoogleAuthUseCase();
