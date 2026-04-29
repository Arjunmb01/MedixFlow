import { IWalletRepository } from "../../domain/repositories/IWalletRepository";
import { TransactionType } from "../../domain/value-objects/enums/TransactionType";
import { Wallet } from "../../domain/entities/Wallet";

export class WalletService {
  constructor(private readonly walletRepo: IWalletRepository) {}

  async creditWallet(patientId: string, amount: number, type: TransactionType, reason: string, stripeSessionId?: string, metadata?: any): Promise<Wallet> {
    if (amount <= 0) throw new Error("Credit amount must be positive");

    let wallet = await this.walletRepo.findByPatientId(patientId);
    if (!wallet) {
      wallet = await this.walletRepo.create(patientId);
    }

    if (stripeSessionId) {
        const existingTx = await this.walletRepo.findTransactionByStripeSessionId(stripeSessionId);
        if (existingTx) {
            console.log(`[WalletService] Duplicate transaction detected for session ${stripeSessionId}. Skipping credit.`);
            return wallet;
        }
    }

    return await this.walletRepo.updateBalance(wallet.id, amount, type, reason, stripeSessionId, metadata);
  }

  async debitWallet(patientId: string, amount: number, type: TransactionType, reason: string, metadata?: any): Promise<Wallet> {
    if (amount <= 0) throw new Error("Debit amount must be positive");

    const wallet = await this.walletRepo.findByPatientId(patientId);
    if (!wallet) throw new Error("Wallet not found");

    if (!wallet.hasSufficientBalance(amount)) {
      throw new Error("Insufficient wallet balance");
    }

    return await this.walletRepo.updateBalance(wallet.id, -amount, type, reason, undefined, metadata);
  }

  async getBalance(patientId: string): Promise<number> {
    const wallet = await this.walletRepo.findByPatientId(patientId);
    return wallet ? wallet.balance : 0;
  }
}
