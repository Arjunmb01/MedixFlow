import jwt from "jsonwebtoken";
import { ITokenService } from "@/domain/services/ITokenService";
import { config } from "@/infrastructure/config";

export class JwtTokenService implements ITokenService {
    generateAccessToken(userId: string, role: string, email?: string): string {
        return jwt.sign(
            { userId, role, email },
            config.jwtAccessSecret,
            { expiresIn: "15m" }
        );
    }

    generateRefreshToken(userId: string, role: string, email?: string): string {
        return jwt.sign(
            { userId, role, email },
            config.jwtRefreshSecret,
            { expiresIn: "7d" }
        );
    }

    verifyAccessToken(token: string): any {
        return jwt.verify(token, config.jwtAccessSecret);
    }

    verifyRefreshToken(token: string): any {
        return jwt.verify(token, config.jwtRefreshSecret);
    }
}
