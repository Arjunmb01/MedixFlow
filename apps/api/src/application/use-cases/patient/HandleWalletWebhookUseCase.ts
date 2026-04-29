import { WalletService } from "../../services/WalletService";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { IPaymentGateway } from "../../../domain/services/IPaymentGateway";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";

export class HandleWalletWebhookUseCase {
  constructor(private readonly walletService: WalletService) {}

  async execute(payload: any, signature: string, webhookSecret: string): Promise<void> {
    const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.STRIPE);
    const verification = await gateway.verifyWebhook(payload, signature, webhookSecret);

    if (!verification.isValid) {
      throw new Error("Invalid webhook signature");
    }

    const event = verification.event;
    const data = verification.data;

    if (event === "checkout.session.completed") {
      const metadata = data.metadata;
      if (metadata && metadata.type === "WALLET_TOPUP") {
        const patientId = metadata.patientId;
        const amount = data.amount_total / 100; // Stripe amount is in cents/paise
        const stripeSessionId = data.id;

        console.log(`[HandleWalletWebhookUseCase] Crediting wallet for patient ${patientId}, amount ${amount}`);
        
        await this.walletService.creditWallet(
          patientId,
          amount,
          TransactionType.TOP_UP,
          "Stripe Wallet Top Up",
          stripeSessionId,
          { stripeEventId: data.id }
        );
      }
    }
  }
}
