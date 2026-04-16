import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { config } from "../../../infrastructure/services/config";

export interface TopUpWalletInput {
  patientId: string;
  amount: number;
  customerEmail?: string;
}

export class TopUpWalletUseCase {
  constructor(private readonly razorpayService: IRazorpayService) {}

  async execute(input: TopUpWalletInput): Promise<{ razorpayOrderId: string; razorpayKeyId: string; amount: number; currency: string }> {
    const razorpayOrder = await this.razorpayService.createOrder({
      amount: input.amount,
      currency: "inr",
      receipt: `topup_${input.patientId}_${Date.now()}`,
      notes: {
        type: "TOP_UP",
        patientId: input.patientId,
      },
    });

    return { 
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: config.razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    };
  }
}
