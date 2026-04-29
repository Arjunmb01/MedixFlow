import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { Wallet } from "../../../domain/entities/Wallet";
import { WalletTransaction } from "../../../domain/entities/WalletTransaction";

export class GetWalletBalanceUseCase {
  constructor(private readonly walletRepo: IWalletRepository) {}

  async execute(patientId: string): Promise<{ wallet: Wallet | null; transactions: WalletTransaction[] }> {
    let wallet = await this.walletRepo.findByPatientId(patientId);
    console.log(`[GetWalletBalanceUseCase] Fetched wallet for patientId=${patientId}: ${wallet ? `balance=${wallet.balance}` : "not found"}`);
    if (!wallet) {
      wallet = await this.walletRepo.create(patientId);
    } else if (isNaN(wallet.balance)) {
      // Auto-repair NaN balance
      console.warn(`[GetWalletBalanceUseCase] Detected NaN balance for patient ${patientId}. Resetting to 0.`);
      wallet = await this.walletRepo.updateBalance(
        wallet.id,
        0,
        "TOP_UP" as any, // Dummy type for repair
        "Automatic balance repair (detected NaN)"
      );
    }

    const transactions = await this.walletRepo.getTransactionHistory(wallet.id);
    return { wallet, transactions };
  }
}
