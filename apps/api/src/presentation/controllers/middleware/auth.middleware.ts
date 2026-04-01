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

      const user = await authRepository.findUserById(decoded.id);

      if (!user || user.status === "INACTIVE" || user.status === "SUSPENDED") {
        return res.status(403).json({
          message: "Your account has been blocked by the administrator.",
          code: "ACCOUNT_BLOCKED",
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
