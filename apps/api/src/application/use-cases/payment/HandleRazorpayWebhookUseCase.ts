import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { NotificationType } from "../../../domain/value-objects/types/notification.types";

export class HandleRazorpayWebhookUseCase {
  constructor(
    private readonly razorpayService: IRazorpayService,
    private readonly paymentRepo: IPaymentRepository,
    private readonly walletRepo: IWalletRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly sendNotificationUseCase: SendNotificationUseCase
  ) {}

  async execute(signature: string, payload: any, rawBody: string, webhookSecret: string): Promise<void> {
    const isValid = this.razorpayService.verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      throw new Error("Invalid Razorpay signature");
    }

    const event = payload.event;

    if (event === "order.paid") {
      const order = payload.payload.order.entity;
      const notes = order.notes;
      const patientId = notes?.patientId;
      const type = notes?.type || "APPOINTMENT";

      if (!patientId) {
        console.error("No patientId found in Razorpay order notes");
        return;
      }

      if (type === "TOP_UP") {
        const amount = order.amount / 100; // Razorpay amount is in paise
        const wallet = await this.walletRepo.findByPatientId(patientId);
        if (wallet) {
          await this.walletRepo.updateBalance(wallet.id, amount, TransactionType.TOP_UP, "Razorpay Wallet Top-up");
          
          await this.sendNotificationUseCase.execute({
            recipientId: patientId,
            title: "Wallet Top-up Successful",
            message: `Your wallet has been credited with ${amount} INR.`,
            type: NotificationType.BOOKED, 
          });
        }
        return;
      }

      // APPOINTMENT FLOW
      const appointmentId = notes?.appointmentId;
      const razorpayPaymentId = payload.payload.payment?.entity.id;
      const razorpaySignature = signature; // Or whatever verification we want to store

      if (!appointmentId) {
        console.error("No appointmentId found in Razorpay order notes");
        return;
      }

      const payment = await this.paymentRepo.findByOrderId(order.id);
      if (!payment) {
        console.error(`Payment not found for order ${order.id}`);
        return;
      }

      await this.paymentRepo.updateStatus(payment.id, PaymentStatus.PAID, razorpayPaymentId, razorpaySignature);

      await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.CONFIRMED);

      const appointment = await this.appointmentRepo.findById(appointmentId);
      if (appointment) {
        // Notify Doctor
        await this.sendNotificationUseCase.execute({
          recipientId: appointment.doctorId,
          title: "New Appointment Confirmed",
          message: `Appointment for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart} has been confirmed.`,
          type: NotificationType.BOOKED,
        });

        // Notify Patient
        await this.sendNotificationUseCase.execute({
          recipientId: appointment.patientId,
          title: "Booking Confirmed",
          message: `Your payment was successful. Your appointment for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart} is now confirmed.`,
          type: NotificationType.BOOKED,
        });
      }
    }
  }
}
