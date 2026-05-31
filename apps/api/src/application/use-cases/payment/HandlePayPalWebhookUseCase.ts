import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IPaymentGateway } from "../../../domain/services/IPaymentGateway";
import { ConfirmPaymentUseCase } from "./confirmPayment.usecase";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";

export class HandlePayPalWebhookUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly confirmPaymentUseCase: ConfirmPaymentUseCase
    ) {}

    async execute(payload: any, signature: string, secret: string): Promise<void> {
        console.log(`[PayPalWebhook] Received event: ${payload.event_type}`);
        
        const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.PAYPAL);
        const result = await gateway.verifyWebhook(payload, signature, secret);

        if (!result.isValid) {
            console.error(`[PayPalWebhook] Invalid signature for event: ${payload.event_type}`);
            throw new Error("Invalid PayPal webhook");
        }

        const data = result.data;
        const eventType = payload.event_type;

        // PayPal event for successful payment capture
        if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
            let orderId: string | undefined;

            if (eventType === "CHECKOUT.ORDER.APPROVED") {
                orderId = data.id;
            } else if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
                // For captures, the order ID might be in supplementary_data or links
                orderId = data.supplementary_data?.related_ids?.order_id;
                
                // Fallback: look for order link
                if (!orderId && data.links) {
                    const orderLink = data.links.find((l: any) => l.rel === "up" || l.href.includes("/orders/"));
                    if (orderLink) {
                        const matches = orderLink.href.match(/\/orders\/([A-Z0-9]+)/);
                        if (matches) orderId = matches[1];
                    }
                }
            }
            
            console.log(`[PayPalWebhook] Processing ${eventType} for OrderID: ${orderId}`);

            if (!orderId) {
                console.warn(`[PayPalWebhook] Could not extract OrderID from ${eventType} payload`);
                return;
            }

            const payment = await this.paymentRepo.findByPayPalOrderId(orderId);
            
            if (payment) {
                console.log(`[PayPalWebhook] Confirming payment ${payment.id} for OrderID ${orderId}`);
                await this.confirmPaymentUseCase.execute({
                    paymentId: payment.id,
                    gatewayData: {
                        paypalCaptureId: eventType === "PAYMENT.CAPTURE.COMPLETED" ? data.id : undefined,
                        paypalOrderId: orderId
                    }
                });
            } else {
                console.warn(`[PayPalWebhook] Payment record not found for OrderID: ${orderId}`);
            }
        }
    }
}
