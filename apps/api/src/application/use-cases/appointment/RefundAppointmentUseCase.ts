import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";
import { RazorpayNotConfiguredError } from "@/shared/errors/RazorpayNotConfiguredError";

export class RefundAppointmentUseCase {
  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly walletRepo: IWalletRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly razorpayService: IRazorpayService | null
  ) {}

  async execute(appointmentId: string, patientId: string, refundToWallet: boolean): Promise<void> {
    const payment = await this.paymentRepo.findByAppointmentId(appointmentId);
    if (!payment || payment.status !== PaymentStatus.PAID) return;

    const wallet = await this.walletRepo.findByPatientId(patientId);
    if (!wallet) throw new Error("Patient wallet not found for refund");

    const paidAmount = Number(payment.amount) || 0;
    const paidWalletAmount = Number(payment.walletAmount) || 0;
    const totalPaid = paidAmount + paidWalletAmount;
    
    console.log(`[RefundAppointmentUseCase] Processing refund for appointment ${appointmentId}. Total paid: ${totalPaid} (Gateway: ${paidAmount}, Wallet: ${paidWalletAmount})`);

    const CANCELLATION_FEE = 50;
    const totalToRefund = Math.max(0, totalPaid - CANCELLATION_FEE);
    
    if (totalToRefund === 0) {
      await this.paymentRepo.updateStatus(payment.id, PaymentStatus.REFUNDED);
      await this.appointmentRepo.updatePaymentStatus(appointmentId, PaymentStatus.REFUNDED);
      return;
    }

    if (refundToWallet) {
      await this.walletRepo.updateBalance(
        wallet.id,
        totalToRefund,
        TransactionType.REFUND,
        `Refund for cancelled appointment ${appointmentId} (after ₹50 cancellation fee)`
      );
    } else {
      const gatewayRefundAmount = Math.min(payment.amount, totalToRefund);
      const walletRefundAmount = totalToRefund - gatewayRefundAmount;

      // 1. Gateway part
      if (gatewayRefundAmount > 0) {
        if (payment.paymentMethod === PaymentMethod.STRIPE && payment.stripePaymentIntentId) {
          const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.STRIPE);
          await gateway.refund(payment.stripePaymentIntentId, gatewayRefundAmount);
        } else if (payment.paymentMethod === PaymentMethod.RAZORPAY && payment.razorpayPaymentId) {
          if (!this.razorpayService) {
            throw new RazorpayNotConfiguredError(
              "Cannot refund Razorpay payment: Razorpay is not configured. Use refund to wallet instead."
            );
          }
          await this.razorpayService.refundPayment(payment.razorpayPaymentId, gatewayRefundAmount);
        }
      }

      // 2. Wallet part
      if (walletRefundAmount > 0) {
        await this.walletRepo.updateBalance(
          wallet.id,
          walletRefundAmount,
          TransactionType.REFUND,
          `Wallet part refund for appointment ${appointmentId}`
        );
      }
    }

    await this.paymentRepo.updateStatus(payment.id, PaymentStatus.REFUNDED);
    await this.appointmentRepo.updatePaymentStatus(appointmentId, PaymentStatus.REFUNDED);
  }
}
