import { UserRole } from "@/domain/value-objects/enums/UserRole";

export interface TokenPayload {
  id: string;
  role: UserRole;
  email?: string;
}

export interface ITokenService {
  generateAccessToken(userId: string, role: UserRole, email?: string): string;
  generateRefreshToken(userId: string, role: UserRole, email?: string): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
