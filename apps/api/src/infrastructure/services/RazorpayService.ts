import Razorpay from "razorpay";
import crypto from "crypto";
import { IRazorpayService, CreateRazorpayOrderInput, RazorpayOrder } from "../../domain/services/IRazorpayService";
import { env as config } from "@/shared/config/env";
import { isRazorpayEnabled } from "@/shared/config/payments";
import { RazorpayNotConfiguredError } from "@/shared/errors/RazorpayNotConfiguredError";

export class RazorpayService implements IRazorpayService {
  private readonly razorpay: Razorpay;

  constructor() {
    if (!isRazorpayEnabled()) {
      throw new RazorpayNotConfiguredError();
    }
    this.razorpay = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
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

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const generatedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      return generatedSignature === signature;
    } catch (error) {
      console.error("Razorpay payment signature verification failed:", error);
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
