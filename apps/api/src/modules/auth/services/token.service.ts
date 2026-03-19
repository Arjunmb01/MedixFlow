import jwt from "jsonwebtoken";

class TokenService {
    generateAccessToken(userId: string, role: string, email?: string) {
        return jwt.sign(
            { userId, role, email },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "15m" }
        )
    }

    generateRefreshToken(userId: string, role: string, email?: string) {
        return jwt.sign(
            { userId, role, email },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: "7d" }
        )
    }

    verifyAccessToken(token: string) {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string)
    }

    verifyRefreshToken(token: string) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string)
    }
}

export default new TokenService();