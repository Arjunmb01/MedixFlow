import { Request, Response, NextFunction } from "express";
import tokenService from "../../modules/auth/services/token.service";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = tokenService.verifyAccessToken(token) as { userId: string; role: string };

    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
