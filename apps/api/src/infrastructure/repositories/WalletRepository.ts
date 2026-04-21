import { PrismaClient } from "@prisma/client";
import { IWalletRepository } from "../../domain/repositories/IWalletRepository";
import { Wallet } from "../../domain/entities/Wallet";
import { WalletTransaction } from "../../domain/entities/WalletTransaction";
import { TransactionType } from "../../domain/value-objects/enums/TransactionType";
import { WalletMapper } from "../database/mappers/WalletMapper";

export class WalletRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPatientId(patientId: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { patientId }
    });
    return wallet ? WalletMapper.toDomain(wallet) : null;
  }

  async create(patientId: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.create({
      data: { patientId, balance: 0 }
    });
    return WalletMapper.toDomain(wallet);
  }

  async updateBalance(walletId: string, amount: number, type: TransactionType, reason?: string): Promise<Wallet> {
    const updatedWallet = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          amount,
          type,
          status: "COMPLETED",
          reason: reason || null
        }
      });

      return wallet;
    });

    return WalletMapper.toDomain(updatedWallet);
  }

  async getTransactionHistory(walletId: string): Promise<WalletTransaction[]> {
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" }
    });
    return transactions.map(WalletMapper.toDomainTransaction);
  }
}
