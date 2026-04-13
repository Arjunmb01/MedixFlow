import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload } from "@/application/interfaces/ITokenService";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class JwtTokenService implements ITokenService {
    constructor(private readonly config: { jwtAccessSecret: string; jwtRefreshSecret: string }) {}

    generateAccessToken(userId: string, role: UserRole, email?: string): string {
        return jwt.sign(
            { id: userId, role, email },
            this.config.jwtAccessSecret,
            { expiresIn: "1h" }
        );
    }

    generateRefreshToken(userId: string, role: UserRole, email?: string): string {
        return jwt.sign(
            { id: userId, role, email },
            this.config.jwtRefreshSecret,
            { expiresIn: "7d" }
        );
    }

    verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(token, this.config.jwtAccessSecret) as TokenPayload;
    }

    verifyRefreshToken(token: string): TokenPayload {
        return jwt.verify(token, this.config.jwtRefreshSecret) as TokenPayload;
    }
}
