import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";
import { ConfirmPaymentUseCase } from "./confirmPayment.usecase";

export class VerifyStripePaymentUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly confirmPaymentUseCase: ConfirmPaymentUseCase
    ) {}

    async execute(sessionId: string): Promise<{ success: boolean; status: string }> {
        console.log(`[VerifyStripePayment] Verifying session: ${sessionId}`);

        // 1. Find payment record
        const payment = await this.paymentRepo.findByStripeSessionId(sessionId);
        if (!payment) {
            throw new Error(`Payment record not found for session ${sessionId}`);
        }

        // 2. If already PAID, return success
        if (payment.status === PaymentStatus.PAID) {
            return { success: true, status: "PAID" };
        }

        // 3. Retrieve session from Stripe
        const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.STRIPE);
        const session = await gateway.retrieveSession(sessionId);

        // 4. Check if paid
        if (session.payment_status === "paid" || session.status === "complete") {
            console.log(`[VerifyStripePayment] Session ${sessionId} is PAID. Confirming...`);
            await this.confirmPaymentUseCase.execute({
                paymentId: payment.id,
                gatewayData: {
                    stripePaymentIntentId: session.payment_intent as string,
                    stripeSessionId: sessionId
                }
            });
            return { success: true, status: "PAID" };
        }

        return { success: false, status: payment.status };
    }
}
