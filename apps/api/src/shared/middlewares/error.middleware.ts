import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCodes";
import { MESSAGES } from "../constants/messages";
import { ZodError } from "zod";
import { env } from "../config/env";

export const errorMiddleware = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = StatusCode.INTERNAL_SERVER_ERROR;
    let message: string = MESSAGES.INTERNAL_ERROR;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        if (err instanceof ZodError) {
            statusCode = StatusCode.BAD_REQUEST;
            message = MESSAGES.VALIDATION_ERROR;
            return res.status(statusCode).json({
                success: false,
                message,
                errors: err.issues,
            });
        }
        
        // SECURITY: Do not leak internal error messages in production
        if (env.NODE_ENV === "production") {
            message = MESSAGES.INTERNAL_ERROR;
        } else {
            message = err.message || MESSAGES.INTERNAL_ERROR;
        }
        
        // Log unexpected errors
        console.error(`[Error] ${err.stack}`);
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};
