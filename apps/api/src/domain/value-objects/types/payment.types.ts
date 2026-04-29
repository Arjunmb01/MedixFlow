import { PaymentMethod } from "../enums/PaymentMethod";
import { PaymentStatus } from "../enums/PaymentStatus";

export interface CreatePaymentInput {
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  stripeSessionId?: string;
  paypalOrderId?: string;
  walletAmount?: number;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  stripePaymentIntentId?: string;
  paypalCaptureId?: string;
}

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
