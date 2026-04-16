export class Wallet {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly balance: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}
