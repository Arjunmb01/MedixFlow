export interface CreateRazorpayOrderInput {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface IRazorpayService {
  createOrder(data: CreateRazorpayOrderInput): Promise<RazorpayOrder>;
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
  refundPayment(paymentId: string, amount: number): Promise<void>;
}
