import { Wallet as PrismaWallet, WalletTransaction as PrismaWalletTransaction } from "@prisma/client";
import { Wallet } from "../../../domain/entities/Wallet";
import { WalletTransaction } from "../../../domain/entities/WalletTransaction";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { TransactionStatus } from "../../../domain/value-objects/enums/TransactionStatus";

export class WalletMapper {
  static toDomain(prismaWallet: PrismaWallet): Wallet {
    return new Wallet(
      prismaWallet.id,
      prismaWallet.patientId,
      prismaWallet.balance,
      prismaWallet.createdAt,
      prismaWallet.updatedAt
    );
  }

  static toDomainTransaction(prismaTransaction: PrismaWalletTransaction): WalletTransaction {
    return new WalletTransaction(
      prismaTransaction.id,
      prismaTransaction.walletId,
      prismaTransaction.amount,
      prismaTransaction.type as TransactionType,
      prismaTransaction.status as TransactionStatus,
      prismaTransaction.reason,
      prismaTransaction.createdAt
    );
  }
}
