import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCodes";
import { MESSAGES } from "../constants/messages";

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
        // Handle Zod validation errors specifically if needed
        if (err.name === "ZodError") {
            statusCode = StatusCode.BAD_REQUEST;
            message = MESSAGES.VALIDATION_ERROR;
            return res.status(statusCode).json({
                success: false,
                message,
                errors: (err as any).errors,
            });
        }
        
        // Log unexpected errors
        console.error(`[Error] ${err.stack}`);
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};
