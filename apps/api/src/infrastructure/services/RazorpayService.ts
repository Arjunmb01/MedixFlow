import Razorpay from "razorpay";
import crypto from "crypto";
import { IRazorpayService, CreateRazorpayOrderInput, RazorpayOrder } from "../../domain/services/IRazorpayService";
import { config } from "./config";

export class RazorpayService implements IRazorpayService {
  private readonly razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
  }

  async createOrder(data: CreateRazorpayOrderInput): Promise<RazorpayOrder> {
    const options = {
      amount: Math.round(data.amount * 100), // Razorpay expects amount in paise
      currency: data.currency.toUpperCase(),
      receipt: data.receipt,
      notes: data.notes,
    };

    const order = await this.razorpay.orders.create(options);

    return {
      id: order.id,
      amount: (order.amount as number) / 100,
      currency: order.currency,
      receipt: order.receipt as string,
      status: order.status,
    };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Razorpay signature verification failed:", error);
      return false;
    }
  }

  async refundPayment(paymentId: string, amount: number): Promise<void> {
    try {
      await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100), // amount in paise
      });
    } catch (error) {
      console.error(`Razorpay refund failed for payment ${paymentId}:`, error);
      throw error;
    }
  }
}
