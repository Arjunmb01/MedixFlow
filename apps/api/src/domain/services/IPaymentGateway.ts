import { PaymentMethod } from "../value-objects/enums/PaymentMethod";

export interface CreatePaymentSessionInput {
    appointmentId: string;
    amount: number;
    currency: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}

export interface PaymentSessionResponse {
    id: string; // Session ID or Order ID
    url?: string; // Redirect URL for Checkout
    clientSecret?: string; // For Elements/SDK
}

export interface WebhookVerificationResult {
    isValid: boolean;
    event: string;
    data: any;
}

export interface IPaymentGateway {
    method: PaymentMethod;
    createSession(data: CreatePaymentSessionInput): Promise<PaymentSessionResponse>;
    verifyWebhook(payload: any, signature: string, secret: string): Promise<WebhookVerificationResult>;
    retrieveSession(sessionId: string): Promise<any>;
    captureOrder(orderId: string): Promise<any>;
    refund(transactionId: string, amount: number): Promise<boolean>;
}
