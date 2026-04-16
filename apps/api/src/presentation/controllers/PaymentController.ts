import { Request, Response } from "express";
import { HandleRazorpayWebhookUseCase } from "../../application/use-cases/payment/HandleRazorpayWebhookUseCase";
import { GetWalletBalanceUseCase } from "../../application/use-cases/patient/GetWalletBalanceUseCase";
import { TopUpWalletUseCase } from "../../application/use-cases/patient/TopUpWalletUseCase";
import { StatusCode } from "../../shared/constants";
import { config } from "../../infrastructure/services/config";

export class PaymentController {
  constructor(
    private readonly handleWebhookUseCase: HandleRazorpayWebhookUseCase,
    private readonly getWalletBalanceUseCase: GetWalletBalanceUseCase,
    private readonly topUpWalletUseCase: TopUpWalletUseCase
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
}
