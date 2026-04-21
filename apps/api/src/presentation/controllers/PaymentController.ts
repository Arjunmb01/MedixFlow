import { Request, Response } from "express";
import { HandleRazorpayWebhookUseCase } from "../../application/use-cases/payment/HandleRazorpayWebhookUseCase";
import { GetWalletBalanceUseCase } from "../../application/use-cases/patient/GetWalletBalanceUseCase";
import { TopUpWalletUseCase } from "../../application/use-cases/patient/TopUpWalletUseCase";
import { VerifyWalletTopUpUseCase } from "../../application/use-cases/patient/VerifyWalletTopUpUseCase";
import { GetPatientFinancialActivityUseCase } from "../../application/use-cases/patient/GetPatientFinancialActivityUseCase";
import { StatusCode } from "../../shared/constants";
import { config } from "../../infrastructure/services/config";

export class PaymentController {
  constructor(
    private readonly handleWebhookUseCase: HandleRazorpayWebhookUseCase,
    private readonly getWalletBalanceUseCase: GetWalletBalanceUseCase,
    private readonly topUpWalletUseCase: TopUpWalletUseCase,
    private readonly verifyWalletTopUpUseCase: VerifyWalletTopUpUseCase,
    private readonly getFinancialActivityUseCase: GetPatientFinancialActivityUseCase
  ) {}

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["x-razorpay-signature"] as string;
    const payload = req.body;
    const rawBody = (req as any).rawBody; 

    try {
      await this.handleWebhookUseCase.execute(sig, payload, rawBody, config.razorpayWebhookSecret);
      res.status(StatusCode.OK).json({ received: true });
    } catch (error: any) {
      console.error("Webhook Error:", error.message);
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
      const result = await this.getFinancialActivityUseCase.execute(patientId);
      console.log(`[PaymentController] Fetched ${result.length} financial activity records for patient: ${patientId}`);
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
