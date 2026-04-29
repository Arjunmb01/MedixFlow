import { Request, Response, NextFunction } from "express";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCodes";
import { MESSAGES } from "../constants/messages";

export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: string;
    };
}

export function createAuthMiddleware(
    tokenService: ITokenService,
    authRepository: IAuthRepository
) {
    return {
        authenticate: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new AppError(MESSAGES.AUTH_REQUIRED, StatusCode.UNAUTHORIZED);
                }

                const token = authHeader.split(" ")[1];
                const decoded = tokenService.verifyAccessToken(token);

                const result = await authRepository.findUserById(decoded.id);

                if (!result) {
                    throw new AppError(MESSAGES.SESSION_EXPIRED, StatusCode.UNAUTHORIZED);
                }

                if (result.user.status === "INACTIVE") {
                    throw new AppError(MESSAGES.ACCOUNT_BLOCKED, StatusCode.FORBIDDEN);
                }

                if (result.user.status === "SUSPENDED") {
                    throw new AppError(MESSAGES.ACCOUNT_SUSPENDED, StatusCode.FORBIDDEN);
                }

                req.user = {
                    id: decoded.id,
                    role: decoded.role,
                };
                next();
            } catch (error) {
                next(error);
            }
        },

        authorize: (roles: string[]) => {
            return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
                if (!req.user || !roles.includes(req.user.role)) {
                    throw new AppError(MESSAGES.INSUFFICIENT_PERMISSIONS, StatusCode.FORBIDDEN);
                }
                next();
            };
        }
    };
}
