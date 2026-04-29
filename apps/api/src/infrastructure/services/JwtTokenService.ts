import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload } from "@/application/interfaces/ITokenService";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class JwtTokenService implements ITokenService {
    constructor(private readonly config: { JWT_ACCESS_SECRET: string; JWT_REFRESH_SECRET: string }) {}

    generateAccessToken(userId: string, role: UserRole, email?: string): string {
        return jwt.sign(
            { id: userId, role, email },
            this.config.JWT_ACCESS_SECRET,
            { expiresIn: "1h" }
        );
    }

    generateRefreshToken(userId: string, role: UserRole, email?: string): string {
        return jwt.sign(
            { id: userId, role, email },
            this.config.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );
    }

    verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(token, this.config.JWT_ACCESS_SECRET) as TokenPayload;
    }

    verifyRefreshToken(token: string): TokenPayload {
        return jwt.verify(token, this.config.JWT_REFRESH_SECRET) as TokenPayload;
    }
}
