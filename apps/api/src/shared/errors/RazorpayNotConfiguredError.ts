import { AppError } from "./AppError";
import { StatusCode } from "../constants/statusCodes";

export class RazorpayNotConfiguredError extends AppError {
    constructor(message = "Razorpay is not configured on this server") {
        super(message, StatusCode.BAD_REQUEST);
    }
}
