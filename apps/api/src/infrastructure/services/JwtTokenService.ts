import jwt from "jsonwebtoken";
import { ITokenService } from "@/domain/services/ITokenService";

export class JwtTokenService implements ITokenService {
    generateAccessToken(userId: string, role: string, email?: string): string {
        return jwt.sign(
            { userId, role, email },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "15m" }
        );
    }

    generateRefreshToken(userId: string, role: string, email?: string): string {
        return jwt.sign(
            { userId, role, email },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: "7d" }
        );
    }

    verifyAccessToken(token: string): any {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    }

    verifyRefreshToken(token: string): any {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    }
}
