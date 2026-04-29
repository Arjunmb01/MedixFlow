import { Payment } from "../entities/Payment";
import { CreatePaymentInput } from "../value-objects/types/payment.types";
import { PaymentStatus } from "../value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../value-objects/enums/PaymentMethod";

export interface IPaymentRepository {
    create(data: CreatePaymentInput): Promise<Payment>;
    findByOrderId(orderId: string): Promise<Payment | null>; // Legacy Razorpay
    findByStripeSessionId(sessionId: string): Promise<Payment | null>;
    findByPayPalOrderId(orderId: string): Promise<Payment | null>;
    findByAppointmentId(appointmentId: string): Promise<Payment | null>;
    updateStatus(id: string, status: PaymentStatus, gatewayData?: {
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        stripePaymentIntentId?: string;
        stripeSessionId?: string;
        paypalOrderId?: string;
        paypalCaptureId?: string;
    }): Promise<Payment>;
    findByPatientId(patientId: string): Promise<Payment[]>;
    findAll(filters?: { status?: PaymentStatus; paymentMethod?: PaymentMethod; page?: number; limit?: number; search?: string }): Promise<{ payments: any[]; total: number }>;
}
