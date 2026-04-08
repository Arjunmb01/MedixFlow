import { Request, Response, NextFunction } from "express";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";

export function createAuthMiddleware(
  tokenService: ITokenService,
  authRepository: IAuthRepository
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = tokenService.verifyAccessToken(token);

      const result = await authRepository.findUserById(decoded.id);

      
      if (!result) {
        console.log("[AuthMiddleware] User not found in DB for ID:", decoded.id);
        return res.status(401).json({ message: "User session not found" });
      }

      if (result.user.status === "INACTIVE") {
        console.log("[AuthMiddleware] User is blocked:", result.user.status);
        return res.status(403).json({
          message: "Your account has been blocked by the administrator.",
          code: "ACCOUNT_BLOCKED",
        });
      }

      if (result.user.status === "SUSPENDED") {
        console.log("[AuthMiddleware] User is suspended:", result.user.status);
        return res.status(403).json({
          message: "Your account has been suspended by the administrator.",
          code: "ACCOUNT_SUSPENDED",
        });
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}
