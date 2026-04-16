import { Wallet } from "../entities/Wallet";
import { WalletTransaction } from "../entities/WalletTransaction";
import { TransactionType } from "../value-objects/enums/TransactionType";

export interface IWalletRepository {
  findByPatientId(patientId: string): Promise<Wallet | null>;
  create(patientId: string): Promise<Wallet>;
  updateBalance(walletId: string, amount: number, type: TransactionType, reason?: string): Promise<Wallet>;
  getTransactionHistory(walletId: string): Promise<WalletTransaction[]>;
}
