import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";
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
import { getPaymentsQuerySchema, getFinancialActivityQuerySchema } from "./dto/validation/payment.dtos";

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
      const validatedQuery = getPaymentsQuerySchema.parse(req.query);
      const result = await this.getAllPaymentsUseCase.execute({
        status: validatedQuery.status as any,
        paymentMethod: validatedQuery.paymentMethod as any,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        search: validatedQuery.search,
        sortBy: validatedQuery.sortBy,
<<<<<<< HEAD
        sortOrder: validatedQuery.sortOrder
=======
        sortOrder: (validatedQuery.sortOrder || 'desc') as any
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
      });
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["x-razorpay-signature"] as string;
    const payload = req.body;
    const rawBody = (req as AuthenticatedRequest).rawBody; 

    try {
      await this.handleWebhookUseCase.execute(sig, payload, rawBody || "", config.RAZORPAY_WEBHOOK_SECRET);
      res.status(StatusCode.OK).json({ received: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bad Request";
      console.error("Razorpay Webhook Error:", message);
      res.status(StatusCode.BAD_REQUEST).json({ message });
    }
  }

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["stripe-signature"] as string;
    const payload = (req as AuthenticatedRequest).rawBody || req.body; 

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

  async getWalletBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.user.id; 
      const result = await this.getWalletBalanceUseCase.execute(patientId);
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async topUpWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.user.id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Invalid amount" });
        return;
      }

      const result = await this.topUpWalletUseCase.execute({
        patientId,
        amount,
        customerEmail: req.user.email
      });

      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async verifyWalletTopUp(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.user.id;
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

  async getFinancialActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
<<<<<<< HEAD
      const patientId = (req as any).user.id;
=======
      const patientId = req.user.id;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
      const validatedQuery = getFinancialActivityQuerySchema.parse(req.query);
      
      const result = await this.getFinancialActivityUseCase.execute(patientId, { 
        page: validatedQuery.page, 
        limit: validatedQuery.limit, 
        search: validatedQuery.search, 
<<<<<<< HEAD
        status: validatedQuery.status,
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        method: validatedQuery.method,
        sortBy: validatedQuery.sortBy,
        sortOrder: validatedQuery.sortOrder
=======
        status: validatedQuery.status as any,
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        method: validatedQuery.method as any,
        sortBy: validatedQuery.sortBy,
        sortOrder: (validatedQuery.sortOrder || 'desc') as any
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
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
