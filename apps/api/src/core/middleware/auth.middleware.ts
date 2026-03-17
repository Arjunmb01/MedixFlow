import { Request, Response, NextFunction } from "express";
import tokenService from "../../modules/auth/services/token.service";
import { prisma } from "../../infrastructure/database/prismaClient";

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { status: true }
    });

    if (!user || user.status === "INACTIVE" || user.status === "SUSPENDED") {
      return res.status(403).json({
        message: "Your account has been blocked by the administrator.",
        code: "ACCOUNT_BLOCKED"
      });
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
