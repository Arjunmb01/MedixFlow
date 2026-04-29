import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";
import { ConfirmPaymentUseCase } from "./confirmPayment.usecase";

export class VerifyPayPalPaymentUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly confirmPaymentUseCase: ConfirmPaymentUseCase
    ) {}

    async execute(orderId: string): Promise<{ success: boolean; status: string }> {
        console.log(`[VerifyPayPalPayment] Verifying order: ${orderId}`);

        // 1. Find payment record
        const payment = await this.paymentRepo.findByPayPalOrderId(orderId);
        if (!payment) {
            throw new Error(`Payment record not found for PayPal order ${orderId}`);
        }

        // 2. If already PAID, return success
        if (payment.status === PaymentStatus.PAID) {
            return { success: true, status: "PAID" };
        }

        // 3. Capture order from PayPal
        const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.PAYPAL);
        const result = await gateway.captureOrder(orderId);

        // 4. Check if successful (PayPal capture status COMPLETED or already captured)
        // Note: The structure of 'result' depends on the PayPal SDK response for capture
        // COMPLETED status means the capture was successful
        if (result.status === "COMPLETED" || result.status === "APPROVED") {
            console.log(`[VerifyPayPalPayment] Order ${orderId} is ${result.status}. Confirming...`);
            
            // Extract capture ID if available
            const captureId = result.purchaseUnits?.[0]?.payments?.captures?.[0]?.id || result.id;

            await this.confirmPaymentUseCase.execute({
                paymentId: payment.id,
                gatewayData: {
                    paypalCaptureId: captureId,
                    paypalOrderId: orderId
                }
            });
            return { success: true, status: "PAID" };
        }

        console.warn(`[VerifyPayPalPayment] Order ${orderId} capture status: ${result.status}`);
        return { success: false, status: result.status || payment.status };
    }
}
