import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { ConfirmPaymentUseCase } from "./confirmPayment.usecase";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";

export interface SimulatePaymentInput {
    appointmentId: string;
    status: "success" | "failure";
}

export class SimulatePaymentUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly confirmPaymentUseCase: ConfirmPaymentUseCase
    ) {}

    async execute(data: SimulatePaymentInput): Promise<void> {
        const payment = await this.paymentRepo.findByAppointmentId(data.appointmentId);
        if (!payment) {
            throw new Error("Payment record not found for this appointment");
        }

        if (data.status === "success") {
            // Simulate successful payment
            await this.confirmPaymentUseCase.execute({
                paymentId: payment.id,
                gatewayData: {
                    stripePaymentIntentId: `sim_pi_${Date.now()}`
                }
            });
        } else {
            // Simulate failed payment
            await this.paymentRepo.updateStatus(payment.id, PaymentStatus.FAILED);
            await this.appointmentRepo.updateStatus(data.appointmentId, AppointmentStatus.PAYMENT_FAILED_HOLD);
            
            // Note: In a real failure, we might set a shorter expiry for the grace period
            // but for simulation, we'll just update the status.
        }
    }
}
