import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IPaymentGateway } from "../../../domain/services/IPaymentGateway";
import { ConfirmPaymentUseCase } from "./confirmPayment.usecase";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";

import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";

import { WalletService } from "../../services/WalletService";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";

export class HandleStripeWebhookUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
        private readonly walletService: WalletService
    ) {}

    async execute(payload: any, signature: string, secret: string): Promise<void> {
        console.log(`[StripeWebhook] Received webhook event`);
        const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.STRIPE);
        const result = await gateway.verifyWebhook(payload, signature, secret);

        if (!result.isValid) {
            console.error(`[StripeWebhook] Signature verification failed`);
            throw new Error("Invalid Stripe webhook signature");
        }

        const event = result.event;
        const data = result.data;
        console.log(`[StripeWebhook] Processing event: ${event}`);

        if (event === "checkout.session.completed" || event === "checkout.session.async_payment_succeeded") {
            const sessionId = data.id;
            const metadata = data.metadata;

            if (metadata && metadata.type === "WALLET_TOPUP") {
                const patientId = metadata.patientId;
                const amount = data.amount_total / 100;

                console.log(`[StripeWebhook] Processing wallet top-up for patient ${patientId}, amount ${amount}`);
                await this.walletService.creditWallet(
                    patientId,
                    amount,
                    TransactionType.TOP_UP,
                    "Stripe Wallet Top Up",
                    sessionId,
                    { stripeEventId: data.id }
                );
                return;
            }

            const payment = await this.paymentRepo.findByStripeSessionId(sessionId);
            
            if (!payment) {
                console.error(`[StripeWebhook] No payment record found for session: ${sessionId}`);
                return;
            }

            if (payment.status === PaymentStatus.PAID) {
                console.log(`[StripeWebhook] Payment ${payment.id} already marked as PAID. Skipping.`);
                return;
            }

            console.log(`[StripeWebhook] Marking payment ${payment.id} as PAID`);
            await this.confirmPaymentUseCase.execute({
                paymentId: payment.id,
                gatewayData: {
                    stripePaymentIntentId: data.payment_intent as string,
                    stripeSessionId: sessionId
                }
            });
        } else if (
            event === "checkout.session.async_payment_failed" || 
            event === "payment_intent.payment_failed" ||
            event === "checkout.session.expired"
        ) {
            console.log(`[StripeWebhook] Handling payment failure for event: ${event}`);
            // For checkout.session events, we have data.id (sessionId)
            // For payment_intent.payment_failed, we might need to find by paymentIntentId
            let payment = null;
            if (data.id && (event.startsWith("checkout.session"))) {
                payment = await this.paymentRepo.findByStripeSessionId(data.id);
            } else if (data.id && event === "payment_intent.payment_failed") {
                // Find by payment intent ID if available in DB, otherwise we might be stuck
                // But usually we save stripeSessionId first.
                // Checkout sessions that fail also fire checkout.session.expired or async_payment_failed
            }

            if (payment) {
                console.log(`[StripeWebhook] Marking payment ${payment.id} as FAILED`);
                await this.paymentRepo.updateStatus(payment.id, PaymentStatus.FAILED);
                await this.appointmentRepo.updateStatus(payment.appointmentId, AppointmentStatus.PAYMENT_FAILED_HOLD);
            } else {
                console.warn(`[StripeWebhook] Could not find payment record for failure event: ${event}`);
            }
        }
    }
}
