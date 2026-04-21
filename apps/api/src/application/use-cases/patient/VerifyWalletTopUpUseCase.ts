import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { Wallet } from "@/domain/entities/Wallet";

export interface VerifyWalletTopUpInput {
  patientId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
}

export class VerifyWalletTopUpUseCase {
  constructor(
    private readonly razorpayService: IRazorpayService,
    private readonly walletRepo: IWalletRepository
  ) {}

  async execute(input: VerifyWalletTopUpInput): Promise<Wallet> {
    const isValid = this.razorpayService.verifyPaymentSignature(
      input.razorpayOrderId,
      input.razorpayPaymentId,
      input.razorpaySignature
    );

    if (!isValid) {
      throw new Error("Invalid payment signature");
    }

    let wallet = await this.walletRepo.findByPatientId(input.patientId);

    if (!wallet) {
      wallet = await this.walletRepo.create(input.patientId);
    }

    return await this.walletRepo.updateBalance(
      wallet.id,
      input.amount,
      TransactionType.TOP_UP,
      `Wallet Top-up (Razorpay ID: ${input.razorpayPaymentId})`
    );
  }
}
