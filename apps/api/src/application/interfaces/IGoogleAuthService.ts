export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
}

export interface IGoogleAuthService {
  verifyToken(idToken: string): Promise<GoogleUser>;
}
