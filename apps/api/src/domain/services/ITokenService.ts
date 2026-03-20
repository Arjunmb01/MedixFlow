export interface ITokenService {
  generateAccessToken(userId: string, role: string, email?: string): string;
  generateRefreshToken(userId: string, role: string, email?: string): string;
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
}
