export interface TokenPayload {
  id: string;
  role: string;
  email?: string;
}

export interface ITokenService {
  generateAccessToken(userId: string, role: string, email?: string): string;
  generateRefreshToken(userId: string, role: string, email?: string): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
