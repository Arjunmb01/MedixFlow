import { Request, Response, NextFunction, RequestHandler } from "express";
import { ITokenService, TokenPayload } from "@/application/interfaces/ITokenService";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCodes";
import { MESSAGES } from "../constants/messages";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { AUTH_COOKIES } from "../constants/auth";

export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: UserRole;
        email?: string;
    };
}

export function createAuthMiddleware(
    tokenService: ITokenService,
    authRepository: IAuthRepository
) {
    const authenticate = async (req: Request, res: Response, next: NextFunction, requiredRoles?: UserRole[]) => {
        try {
            let token: string | undefined;
            let decoded: TokenPayload | undefined;

            // 1. Try Authorization header first (backward compatibility)
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
                try {
                    decoded = tokenService.verifyAccessToken(token);
                    // If we have a header token, it takes precedence but must match required roles if specified
                    if (requiredRoles && !requiredRoles.includes(decoded.role as UserRole)) {
                        token = undefined; // Reset to try cookies
                    }
                } catch (e) {
                    token = undefined; // Invalid header token, try cookies
                }
            }

            // 2. Try role-specific cookies
            if (!token) {
                // If specific roles are required, try those cookies first
                const rolesToTry = requiredRoles || [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN];
                
                for (const role of rolesToTry) {
                    const cookieName = role === UserRole.ADMIN ? AUTH_COOKIES.ADMIN.ACCESS :
                                     role === UserRole.DOCTOR ? AUTH_COOKIES.DOCTOR.ACCESS :
                                     AUTH_COOKIES.PATIENT.ACCESS;
                    const cookieToken = req.cookies[cookieName];
                    
                    if (cookieToken) {
                        try {
                            const payload = tokenService.verifyAccessToken(cookieToken);
                            if (payload.role === role) {
                                token = cookieToken;
                                decoded = payload;
                                break; // Found a valid token for a required role
                            }
                        } catch (e) {
                            continue; // Invalid cookie, try next
                        }
                    }
                }
            }

            if (!token || !decoded) {
                throw new AppError(MESSAGES.AUTH_REQUIRED, StatusCode.UNAUTHORIZED);
            }

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
                role: decoded.role as UserRole,
                email: decoded.email,
            };
            next();
        } catch (error) {
            next(error);
        }
    };

    return {
        authenticate: (async (req, res, next) => 
            authenticate(req, res, next)) as RequestHandler,
        
        authenticatePatient: (async (req, res, next) => 
            authenticate(req, res, next, [UserRole.PATIENT])) as RequestHandler,
        
        authenticateDoctor: (async (req, res, next) => 
            authenticate(req, res, next, [UserRole.DOCTOR])) as RequestHandler,
        
        authenticateAdmin: (async (req, res, next) => 
            authenticate(req, res, next, [UserRole.ADMIN])) as RequestHandler,
            
        authenticateRoles: (roles: UserRole[]) => (async (req, res, next) => 
            authenticate(req, res, next, roles)) as RequestHandler,

        authorize: (roles: UserRole[]) => {
            return ((req: Request, res: Response, next: NextFunction) => {
                if (!req.user || !roles.includes(req.user.role)) {
                    throw new AppError(MESSAGES.INSUFFICIENT_PERMISSIONS, StatusCode.FORBIDDEN);
                }
                next();
            }) as RequestHandler;
        }
    };
}

