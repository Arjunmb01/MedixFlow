"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetWalletBalanceUseCase_1 = require("@/application/use-cases/patient/GetWalletBalanceUseCase");
describe("GetWalletBalanceUseCase", () => {
    let useCase;
    let mockWalletRepo;
    beforeEach(() => {
        mockWalletRepo = {
            findByPatientId: jest.fn(),
            create: jest.fn(),
            updateBalance: jest.fn(),
            getTransactionHistory: jest.fn(),
        };
        useCase = new GetWalletBalanceUseCase_1.GetWalletBalanceUseCase(mockWalletRepo);
    });
    it("should return wallet and transactions if wallet exists", async () => {
        // Arrange
        const patientId = "patient_123";
        const mockWallet = { id: "w_1", patientId, balance: 500 };
        const mockTransactions = [{ id: "tx_1", amount: 500, type: "TOP_UP" }];
        mockWalletRepo.findByPatientId.mockResolvedValue(mockWallet);
        mockWalletRepo.getTransactionHistory.mockResolvedValue(mockTransactions);
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
        mockWalletRepo.create.mockResolvedValue(newWallet);
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
        mockWalletRepo.findByPatientId.mockResolvedValue(nanWallet);
        mockWalletRepo.updateBalance.mockResolvedValue(repairedWallet);
        mockWalletRepo.getTransactionHistory.mockResolvedValue([]);
        // Act
        const result = await useCase.execute(patientId);
        // Assert
        expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith("w_1", 0, "TOP_UP", expect.stringContaining("repair"));
        expect(result.wallet?.balance).toBe(0);
    });
    it("should propagate repository errors", async () => {
        // Arrange
        mockWalletRepo.findByPatientId.mockRejectedValue(new Error("Repo error"));
        // Act & Assert
        await expect(useCase.execute("id")).rejects.toThrow("Repo error");
    });
});
