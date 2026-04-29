import { Request, Response } from "express";
import { HandleRazorpayWebhookUseCase } from "../../application/use-cases/payment/HandleRazorpayWebhookUseCase";
import { GetWalletBalanceUseCase } from "../../application/use-cases/patient/GetWalletBalanceUseCase";
import { CreateWalletTopUpUseCase } from "../../application/use-cases/patient/CreateWalletTopUpUseCase";
import { VerifyWalletTopUpUseCase } from "../../application/use-cases/patient/VerifyWalletTopUpUseCase";
import { GetPatientFinancialActivityUseCase } from "../../application/use-cases/patient/GetPatientFinancialActivityUseCase";
import { GetAllPaymentsUseCase } from "../../application/use-cases/payment/GetAllPaymentsUseCase";
import { HandleStripeWebhookUseCase } from "../../application/use-cases/payment/HandleStripeWebhookUseCase";
import { HandlePayPalWebhookUseCase } from "../../application/use-cases/payment/HandlePayPalWebhookUseCase";
import { SimulatePaymentUseCase } from "../../application/use-cases/payment/SimulatePaymentUseCase";
import { RetryPaymentUseCase } from "../../application/use-cases/payment/RetryPaymentUseCase";
import { VerifyStripePaymentUseCase } from "../../application/use-cases/payment/VerifyStripePaymentUseCase";
import { VerifyPayPalPaymentUseCase } from "../../application/use-cases/payment/VerifyPayPalPaymentUseCase";
import { VerifyRazorpayPaymentUseCase } from "../../application/use-cases/payment/VerifyRazorpayPaymentUseCase";
import { StatusCode } from "../../shared/constants";
import { env as config } from "../../shared/config/env";

export class PaymentController {
  constructor(
    private readonly handleWebhookUseCase: HandleRazorpayWebhookUseCase,
    private readonly getWalletBalanceUseCase: GetWalletBalanceUseCase,
    private readonly topUpWalletUseCase: CreateWalletTopUpUseCase,
    private readonly verifyWalletTopUpUseCase: VerifyWalletTopUpUseCase,
    private readonly getFinancialActivityUseCase: GetPatientFinancialActivityUseCase,
    private readonly getAllPaymentsUseCase: GetAllPaymentsUseCase,
    private readonly handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
    private readonly handlePayPalWebhookUseCase: HandlePayPalWebhookUseCase,
    private readonly simulatePaymentUseCase: SimulatePaymentUseCase,
    private readonly retryPaymentUseCase: RetryPaymentUseCase,
    private readonly verifyStripePaymentUseCase: VerifyStripePaymentUseCase,
    private readonly verifyPayPalPaymentUseCase: VerifyPayPalPaymentUseCase,
    private readonly verifyRazorpayPaymentUseCase: VerifyRazorpayPaymentUseCase
  ) {}

  async getAllPayments(req: Request, res: Response): Promise<void> {
    try {
      const { status, paymentMethod, page, limit, search } = req.query;
      const result = await this.getAllPaymentsUseCase.execute({
        status: status as any,
        paymentMethod: paymentMethod as any,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string
      });
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["x-razorpay-signature"] as string;
    const payload = req.body;
    const rawBody = (req as any).rawBody; 

    try {
      await this.handleWebhookUseCase.execute(sig, payload, rawBody, config.RAZORPAY_WEBHOOK_SECRET);
      res.status(StatusCode.OK).json({ received: true });
    } catch (error: any) {
      console.error("Razorpay Webhook Error:", error.message);
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["stripe-signature"] as string;
    const payload = (req as any).rawBody || req.body; // Stripe needs raw body for verification

    try {
      await this.handleStripeWebhookUseCase.execute(payload, sig, config.STRIPE_WEBHOOK_SECRET);
      res.status(StatusCode.OK).json({ received: true });
    } catch (error: any) {
      console.error("Stripe Webhook Error:", error.message);
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async handlePayPalWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["paypal-transmission-sig"] as string; // Placeholder for PayPal verification
    const payload = req.body;

    try {
      await this.handlePayPalWebhookUseCase.execute(payload, sig, config.PAYPAL_WEBHOOK_ID);
      res.status(StatusCode.OK).json({ received: true });
    } catch (error: any) {
      console.error("PayPal Webhook Error:", error.message);
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async getWalletBalance(req: Request, res: Response): Promise<void> {
    try {
      const patientId = (req as any).user.id; // Assuming user is attached via middleware
      const result = await this.getWalletBalanceUseCase.execute(patientId);
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async topUpWallet(req: Request, res: Response): Promise<void> {
    try {
      const patientId = (req as any).user.id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Invalid amount" });
        return;
      }

      const result = await this.topUpWalletUseCase.execute({
        patientId,
        amount,
        customerEmail: (req as any).user.email
      });

      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async verifyWalletTopUp(req: Request, res: Response): Promise<void> {
    try {
      const patientId = (req as any).user.id;
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !amount) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Missing required verification data" });
        return;
      }

      const result = await this.verifyWalletTopUpUseCase.execute({
        patientId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount
      });

      res.status(StatusCode.OK).json({
        message: "Wallet top-up verified successfully",
        balance: result.balance
      });
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async getFinancialActivity(req: Request, res: Response): Promise<void> {
    try {
      const patientId = (req as any).user.id;
      const { search, status, startDate, endDate, method, page: qPage, limit: qLimit } = req.query;
      const page = parseInt(qPage as string) || 1;
      const limit = parseInt(qLimit as string) || 10;
      const result = await this.getFinancialActivityUseCase.execute(patientId, { 
        page, 
        limit, 
        search: search as string, 
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        method: method as string
      });
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async simulatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId, status } = req.body;
      await this.simulatePaymentUseCase.execute({ appointmentId, status });
      res.status(StatusCode.OK).json({ success: true, message: `Payment simulation (${status}) completed.` });
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async retryPayment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.body;
      const result = await this.retryPaymentUseCase.execute({ appointmentId });
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async verifyStripePayment(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const result = await this.verifyStripePaymentUseCase.execute(sessionId as string);
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async verifyPayPalPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const result = await this.verifyPayPalPaymentUseCase.execute(orderId as string);
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  async verifyRazorpayPayment(req: Request, res: Response): Promise<void> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const result = await this.verifyRazorpayPaymentUseCase.execute({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }
}
