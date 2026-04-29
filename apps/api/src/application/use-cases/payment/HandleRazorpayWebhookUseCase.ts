import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { NotificationType } from "../../../domain/value-objects/types/notification.types";
import { IQueueService } from "../../../domain/services/IQueueService";
import { SocketService } from "../../../infrastructure/services/SocketService";

export class HandleRazorpayWebhookUseCase {
  constructor(
    private readonly razorpayService: IRazorpayService,
    private readonly paymentRepo: IPaymentRepository,
    private readonly walletRepo: IWalletRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly queueService: IQueueService,
    private readonly socketService: SocketService
  ) {}

  async execute(signature: string, payload: any, rawBody: string, webhookSecret: string): Promise<void> {
    const isValid = this.razorpayService.verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      throw new Error("Invalid Razorpay signature");
    }

    const event = payload.event;
    console.log(`[Webhook] Processing event: ${event}`);

    if (event === "order.paid" || event === "payment.captured") {
      const order = payload.payload.order?.entity;
      const payment = payload.payload.payment?.entity;
      
      const notes = order?.notes || payment?.notes;
      const patientId = notes?.patientId;
      const type = notes?.type || "APPOINTMENT";

      if (!patientId) {
        console.error("No patientId found in Razorpay webhook notes");
        return;
      }

      const amount = (payment?.amount || order?.amount) / 100;

      if (type === "TOP_UP") {
        console.log(`[Webhook] Processing TOP_UP for patient ${patientId}, amount: ${amount}`);
        const wallet = await this.walletRepo.findByPatientId(patientId);
        if (wallet) {
          // Check if transaction already exists (idempotency)
          const history = await this.walletRepo.getTransactionHistory(wallet.id);
          const alreadyProcessed = history.some(tx => 
             tx.reason?.includes(payment?.id || "")
          );

          if (alreadyProcessed) {
            console.log(`[Webhook] TOP_UP for payment ${payment?.id} already processed.`);
            return;
          }

          await this.walletRepo.updateBalance(
            wallet.id, 
            amount, 
            TransactionType.TOP_UP, 
            `Razorpay Wallet Top-up (Payment ID: ${payment?.id || "N/A"})`
          );
          
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
      const razorpayPaymentId = payment?.id;
      const razorpaySignature = signature;

      if (!appointmentId) {
        // Only log error if not a TOP_UP and no appointmentId
        console.error("No appointmentId found in Razorpay webhook notes");
        return;
      }

      const paymentRecord = await this.paymentRepo.findByOrderId(order?.id || payment?.order_id);
      if (!paymentRecord) {
        console.error(`Payment record not found for order ${order?.id || payment?.order_id}`);
        return;
      }

      if (paymentRecord.status === PaymentStatus.PAID) {
        console.log(`[Webhook] Payment ${paymentRecord.id} already marked as PAID.`);
        return;
      }

      await this.paymentRepo.updateStatus(paymentRecord.id, PaymentStatus.PAID, { 
        razorpayPaymentId, 
        razorpaySignature 
      });

      await this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.BOOKED);
      
      const appointment = await this.appointmentRepo.findById(appointmentId);
      if (appointment) {
        // Assign Queue Number
        const queueNumber = await this.queueService.addToQueue(appointment.doctorId, appointment.appointmentDate, appointmentId);
        await this.appointmentRepo.updateQueuePosition(appointmentId, queueNumber);

        // Notify via Sockets
        this.socketService.emitAppointmentBooked(appointment.doctorId, { ...appointment, queueNumber, status: AppointmentStatus.BOOKED });
        const fullQueue = await this.appointmentRepo.getTodaysQueue(appointment.doctorId);
        this.socketService.emitQueueUpdated(appointment.doctorId, appointment.appointmentDate, fullQueue);
        await this.sendNotificationUseCase.execute({
          recipientId: appointment.doctorId,
          title: "New Appointment BOOKED",
          message: `Appointment for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart} has been BOOKED.`,
          type: NotificationType.BOOKED,
        });

        await this.sendNotificationUseCase.execute({
          recipientId: appointment.patientId,
          title: "Booking BOOKED",
          message: `Your payment was successful. Your appointment for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart} is now BOOKED.`,
          type: NotificationType.BOOKED,
        });
      }
    }
  }
}
