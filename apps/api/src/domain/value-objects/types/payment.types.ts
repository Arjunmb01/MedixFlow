import { PaymentMethod } from "../enums/PaymentMethod";

export interface CreatePaymentInput {
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  paymentMethod?: PaymentMethod;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
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
