import { VerifyWalletTopUpUseCase, VerifyWalletTopUpInput } from "@/application/use-cases/patient/VerifyWalletTopUpUseCase";
import { IRazorpayService } from "@/domain/services/IRazorpayService";
import { IWalletRepository } from "@/domain/repositories/IWalletRepository";
import { TransactionType } from "@/domain/value-objects/enums/TransactionType";

describe("VerifyWalletTopUpUseCase", () => {
  let useCase: VerifyWalletTopUpUseCase;
  let mockRazorpayService: jest.Mocked<IRazorpayService>;
  let mockWalletRepo: jest.Mocked<IWalletRepository>;

  beforeEach(() => {
    mockRazorpayService = {
      verifyPaymentSignature: jest.fn(),
      createOrder: jest.fn(),
      verifyPayment: jest.fn(),
    } as any;

    mockWalletRepo = {
      findByPatientId: jest.fn(),
      create: jest.fn(),
      updateBalance: jest.fn(),
    } as any;

    useCase = new VerifyWalletTopUpUseCase(mockRazorpayService, mockWalletRepo);
  });

  it("should successfully verify payment and update wallet balance", async () => {
    // Arrange
    const input: VerifyWalletTopUpInput = {
      patientId: "patient_123",
      razorpayOrderId: "order_123",
      razorpayPaymentId: "pay_123",
      razorpaySignature: "sig_123",
      amount: 500,
    };

    mockRazorpayService.verifyPaymentSignature.mockReturnValue(true);
    mockWalletRepo.findByPatientId.mockResolvedValue({ id: "w_1", balance: 100 } as any);
    mockWalletRepo.updateBalance.mockResolvedValue({ id: "w_1", balance: 600 } as any);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.balance).toBe(600);
    expect(mockRazorpayService.verifyPaymentSignature).toHaveBeenCalledWith(
      "order_123",
      "pay_123",
      "sig_123"
    );
    expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith(
      "w_1",
      500,
      TransactionType.TOP_UP,
      expect.stringContaining("pay_123")
    );
  });

  it("should create wallet if it does not exist before updating balance", async () => {
    // Arrange
    const input: VerifyWalletTopUpInput = {
      patientId: "patient_123",
      razorpayOrderId: "order_123",
      razorpayPaymentId: "pay_123",
      razorpaySignature: "sig_123",
      amount: 500,
    };

    mockRazorpayService.verifyPaymentSignature.mockReturnValue(true);
    mockWalletRepo.findByPatientId.mockResolvedValue(null);
    mockWalletRepo.create.mockResolvedValue({ id: "w_new", balance: 0 } as any);
    mockWalletRepo.updateBalance.mockResolvedValue({ id: "w_new", balance: 500 } as any);

    // Act
    await useCase.execute(input);

    // Assert
    expect(mockWalletRepo.create).toHaveBeenCalledWith("patient_123");
    expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith(
      "w_new",
      500,
      TransactionType.TOP_UP,
      expect.any(String)
    );
  });

  it("should throw error if signature is invalid", async () => {
    // Arrange
    mockRazorpayService.verifyPaymentSignature.mockReturnValue(false);

    // Act & Assert
    await expect(useCase.execute({} as any)).rejects.toThrow("Invalid payment signature");
  });

  it("should propagate repository errors", async () => {
    // Arrange
    mockRazorpayService.verifyPaymentSignature.mockReturnValue(true);
    mockWalletRepo.findByPatientId.mockRejectedValue(new Error("Database error"));

    // Act & Assert
    await expect(useCase.execute({ patientId: "id" } as any)).rejects.toThrow("Database error");
  });
});
