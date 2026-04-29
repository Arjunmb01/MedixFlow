import Stripe from "stripe";
import { IPaymentGateway, CreatePaymentSessionInput, PaymentSessionResponse, WebhookVerificationResult } from "../../domain/services/IPaymentGateway";
import { PaymentMethod } from "../../domain/value-objects/enums/PaymentMethod";
import { env } from "../../shared/config/env";

export class StripeGateway implements IPaymentGateway {
    public readonly method = PaymentMethod.STRIPE;
    private stripe: any;

    constructor() {
        if (!env.STRIPE_SECRET_KEY) {
            console.warn("[StripeGateway] STRIPE_SECRET_KEY is missing from environment variables.");
        }
        this.stripe = new (Stripe as any)(env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2024-04-10",
        });
    }

    async createSession(data: CreatePaymentSessionInput): Promise<PaymentSessionResponse> {
        try {
            console.log(`[StripeGateway] Creating session for appointment: ${data.appointmentId}, amount: ${data.amount}, currency: ${data.currency}`);
            
            const sessionParams: any = {
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: data.currency.toLowerCase(),
                            product_data: {
                                name: data.metadata?.type === "WALLET_TOPUP" ? `Wallet Top Up` : `Appointment Booking`,
                                description: data.metadata?.type === "WALLET_TOPUP" 
                                    ? `Add funds to your MedixFlow wallet` 
                                    : `Booking for Appointment ID: ${data.appointmentId}`,
                            },
                            unit_amount: Math.max(1, Math.round(data.amount * 100)), // Ensure at least 1 cent/paise
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: data.successUrl,
                cancel_url: data.cancelUrl,
                client_reference_id: data.appointmentId,
                metadata: {
                    ...data.metadata,
                    appointmentId: data.appointmentId
                },
            };

            if (data.customerEmail) {
                sessionParams.customer_email = data.customerEmail;
            }

            const session = await this.stripe.checkout.sessions.create(sessionParams);

            console.log(`[StripeGateway] Session created successfully: ${session.id}`);

            return {
                id: session.id,
                url: session.url || undefined,
            };
        } catch (error: any) {
            console.error("[StripeGateway] Create Session Error:", error.message, error.stack);
            // Re-throw with a more descriptive message if possible
            if (error.type === 'StripeAuthenticationError') {
                throw new Error("Stripe authentication failed. Please check your API keys.");
            }
            throw new Error(`Failed to create Stripe checkout session: ${error.message}`);
        }
    }

    async verifyWebhook(payload: any, signature: string, secret: string): Promise<WebhookVerificationResult> {
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
            return {
                isValid: true,
                event: event.type,
                data: event.data.object,
            };
        } catch (error: any) {
            console.error("[StripeGateway] Webhook Verification Error:", error.message);
            return { isValid: false, event: "", data: null };
        }
    }

    async retrieveSession(sessionId: string): Promise<any> {
        try {
            console.log(`[StripeGateway] Retrieving session: ${sessionId}`);
            return await this.stripe.checkout.sessions.retrieve(sessionId);
        } catch (error: any) {
            console.error("[StripeGateway] Retrieve Session Error:", error.message);
            throw error;
        }
    }

    async captureOrder(orderId: string): Promise<any> {
        return this.retrieveSession(orderId);
    }

    async refund(transactionId: string, amount: number): Promise<boolean> {
        try {
            console.log(`[StripeGateway] Processing refund for intent: ${transactionId}, amount: ${amount}`);
            await this.stripe.refunds.create({
                payment_intent: transactionId,
                amount: Math.round(amount * 100),
            });
            return true;
        } catch (error: any) {
            console.error("[StripeGateway] Refund Error:", error.message);
            return false;
        }
    }
}
