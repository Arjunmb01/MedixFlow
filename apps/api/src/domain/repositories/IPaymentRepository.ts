import { Payment } from "../entities/Payment";
import { CreatePaymentInput } from "../value-objects/types/payment.types";
import { PaymentStatus } from "../value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../value-objects/enums/PaymentMethod";

export interface IPaymentRepository {
    create(data: CreatePaymentInput): Promise<Payment>;
    findByOrderId(orderId: string): Promise<Payment | null>;
    findByAppointmentId(appointmentId: string): Promise<Payment | null>;
    updateStatus(id: string, status: PaymentStatus, razorpayPaymentId?: string, razorpaySignature?: string): Promise<Payment>;
    findByPatientId(patientId: string): Promise<Payment[]>;
    findAll(filters?: { status?: PaymentStatus; paymentMethod?: PaymentMethod }): Promise<Payment[]>;
}
