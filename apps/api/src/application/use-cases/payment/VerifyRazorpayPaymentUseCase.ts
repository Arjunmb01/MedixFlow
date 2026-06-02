import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { ConfirmPaymentUseCase } from "./confirmPayment.usecase";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { RazorpayNotConfiguredError } from "@/shared/errors/RazorpayNotConfiguredError";

export interface VerifyRazorpayPaymentInput {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export class VerifyRazorpayPaymentUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly razorpayService: IRazorpayService | null,
        private readonly confirmPaymentUseCase: ConfirmPaymentUseCase
    ) {}

    async execute(data: VerifyRazorpayPaymentInput): Promise<{ success: boolean }> {
        if (!this.razorpayService) {
            throw new RazorpayNotConfiguredError();
        }
        console.log(`[VerifyRazorpayPayment] Verifying order: ${data.razorpayOrderId}`);

        // 1. Verify signature
        const isValid = this.razorpayService.verifyPaymentSignature(
            data.razorpayOrderId,
            data.razorpayPaymentId,
            data.razorpaySignature
        );

        if (!isValid) {
            throw new Error("Invalid Razorpay payment signature");
        }

        // 2. Find payment record
        const payment = await this.paymentRepo.findByOrderId(data.razorpayOrderId);
        if (!payment) {
            throw new Error(`Payment record not found for Razorpay order ${data.razorpayOrderId}`);
        }

        // 3. If already PAID, return success
        if (payment.status === PaymentStatus.PAID) {
            return { success: true };
        }

        // 4. Confirm payment in database
        await this.confirmPaymentUseCase.execute({
            paymentId: payment.id,
            gatewayData: {
                razorpayPaymentId: data.razorpayPaymentId,
                razorpaySignature: data.razorpaySignature
            }
        });

        return { success: true };
    }
}
