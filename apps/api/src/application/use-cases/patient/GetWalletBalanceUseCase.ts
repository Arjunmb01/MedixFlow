import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { Wallet } from "../../../domain/entities/Wallet";
import { WalletTransaction } from "../../../domain/entities/WalletTransaction";

export class GetWalletBalanceUseCase {
  constructor(private readonly walletRepo: IWalletRepository) {}

  async execute(patientId: string): Promise<{ wallet: Wallet | null; transactions: WalletTransaction[] }> {
    let wallet = await this.walletRepo.findByPatientId(patientId);
    
    // If wallet doesn't exist, create it (lazy initialization)
    if (!wallet) {
      wallet = await this.walletRepo.create(patientId);
    }

    const transactions = await this.walletRepo.getTransactionHistory(wallet.id);
    return { wallet, transactions };
  }
}
