import { IPaymentGateway } from "../../../domain/services/IPaymentGateway";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { env as config } from "../../../shared/config/env";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";

export interface CreateWalletTopUpInput {
  patientId: string;
  amount: number;
  customerEmail?: string;
}

export class CreateWalletTopUpUseCase {
  async execute(input: CreateWalletTopUpInput): Promise<{ sessionId: string; url: string }> {
    const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.STRIPE);
    
    const session = await gateway.createSession({
      appointmentId: `TOPUP_${input.patientId}_${Date.now()}`,
      amount: input.amount,
      currency: "inr",
      customerEmail: input.customerEmail,
      successUrl: `${config.FRONTEND_URL}/patient/wallet?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${config.FRONTEND_URL}/patient/wallet?status=cancelled`,
      metadata: {
        type: "WALLET_TOPUP",
        patientId: input.patientId,
      }
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe session URL");
    }

    return {
      sessionId: session.id,
      url: session.url
    };
  }
}
