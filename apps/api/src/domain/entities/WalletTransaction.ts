import { TransactionType } from "../value-objects/enums/TransactionType";
import { TransactionStatus } from "../value-objects/enums/TransactionStatus";

export class WalletTransaction {
  constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly status: TransactionStatus,
    public readonly reason: string | null,
    public readonly createdAt: Date
  ) {}
}
