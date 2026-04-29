import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IPaymentGateway } from "../../../domain/services/IPaymentGateway";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";
import { env as config } from "../../../shared/config/env";
import { IPatientRepository } from "../../../domain/repositories/IPatientRepository";

export interface RetryPaymentInput {
    appointmentId: string;
}

export class RetryPaymentUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly patientRepo: IPatientRepository
    ) {}

    async execute(data: RetryPaymentInput): Promise<{ stripeUrl?: string; paypalUrl?: string }> {
        const appointment = await this.appointmentRepo.findById(data.appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        if (appointment.status !== AppointmentStatus.PENDING && appointment.status !== AppointmentStatus.PAYMENT_FAILED_HOLD) {
            throw new Error(`Cannot retry payment for appointment with status: ${appointment.status}`);
        }

        const payment = await this.paymentRepo.findByAppointmentId(data.appointmentId);
        if (!payment) throw new Error("Payment record not found");

        if (payment.paymentMethod === PaymentMethod.STRIPE) {
            const patient = await this.patientRepo.findById(appointment.patientId);
            const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.STRIPE);
            
            const session = await gateway.createSession({
                appointmentId: appointment.id,
                amount: payment.amount,
                currency: payment.currency,
                customerEmail: patient?.email || undefined,
                successUrl: `${config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment.id}`,
                cancelUrl: `${config.FRONTEND_URL}/patient/billing?status=failed&appointment_id=${appointment.id}`,
                metadata: { appointmentId: appointment.id, patientId: appointment.patientId }
            });

            // Update payment record with new session ID
            await this.paymentRepo.updateStatus(payment.id, payment.status, {
                stripeSessionId: session.id
            });

            return { stripeUrl: session.url };
        }

        throw new Error(`Retry not implemented for ${payment.paymentMethod}`);
    }
}
