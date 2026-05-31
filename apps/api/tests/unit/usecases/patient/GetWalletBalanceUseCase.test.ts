import { GetWalletBalanceUseCase } from "@/application/use-cases/patient/GetWalletBalanceUseCase";
import { IWalletRepository } from "@/domain/repositories/IWalletRepository";

describe("GetWalletBalanceUseCase", () => {
  let useCase: GetWalletBalanceUseCase;
  let mockWalletRepo: jest.Mocked<IWalletRepository>;

  beforeEach(() => {
    mockWalletRepo = {
      findByPatientId: jest.fn(),
      create: jest.fn(),
      updateBalance: jest.fn(),
      getTransactionHistory: jest.fn(),
    } as any;

    useCase = new GetWalletBalanceUseCase(mockWalletRepo);
  });

  it("should return wallet and transactions if wallet exists", async () => {
    // Arrange
    const patientId = "patient_123";
    const mockWallet = { id: "w_1", patientId, balance: 500 };
    const mockTransactions = [{ id: "tx_1", amount: 500, type: "TOP_UP" }];

    mockWalletRepo.findByPatientId.mockResolvedValue(mockWallet as any);
    mockWalletRepo.getTransactionHistory.mockResolvedValue(mockTransactions as any);

    // Act
    const result = await useCase.execute(patientId);

    // Assert
    expect(result.wallet).toEqual(mockWallet);
    expect(result.transactions).toEqual(mockTransactions);
    expect(mockWalletRepo.findByPatientId).toHaveBeenCalledWith(patientId);
  });

  it("should create a new wallet if it does not exist", async () => {
    // Arrange
    const patientId = "patient_123";
    const newWallet = { id: "w_new", patientId, balance: 0 };
    
    mockWalletRepo.findByPatientId.mockResolvedValue(null);
    mockWalletRepo.create.mockResolvedValue(newWallet as any);
    mockWalletRepo.getTransactionHistory.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(patientId);

    // Assert
    expect(mockWalletRepo.create).toHaveBeenCalledWith(patientId);
    expect(result.wallet).toEqual(newWallet);
  });

  it("should repair NaN balance", async () => {
    // Arrange
    const patientId = "patient_123";
    const nanWallet = { id: "w_1", patientId, balance: NaN };
    const repairedWallet = { id: "w_1", patientId, balance: 0 };

    mockWalletRepo.findByPatientId.mockResolvedValue(nanWallet as any);
    mockWalletRepo.updateBalance.mockResolvedValue(repairedWallet as any);
    mockWalletRepo.getTransactionHistory.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(patientId);

    // Assert
    expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith(
      "w_1",
      0,
      "TOP_UP",
      expect.stringContaining("repair")
    );
    expect(result.wallet?.balance).toBe(0);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    mockWalletRepo.findByPatientId.mockRejectedValue(new Error("Repo error"));

    // Act & Assert
    await expect(useCase.execute("id")).rejects.toThrow("Repo error");
  });
});
