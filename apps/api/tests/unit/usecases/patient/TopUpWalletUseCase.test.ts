import { TopUpWalletUseCase, TopUpWalletInput } from "@/application/use-cases/patient/TopUpWalletUseCase";
import { IRazorpayService } from "@/domain/services/IRazorpayService";
import { env as config } from "@/shared/config/env";

jest.mock("@/shared/config/env", () => ({
  env: {
    RAZORPAY_KEY_ID: "rzp_test_123",
  },
}));

describe("TopUpWalletUseCase", () => {
  let useCase: TopUpWalletUseCase;
  let mockRazorpayService: jest.Mocked<IRazorpayService>;

  beforeEach(() => {
    mockRazorpayService = {
      createOrder: jest.fn(),
      verifyPayment: jest.fn(),
    } as any;

    useCase = new TopUpWalletUseCase(mockRazorpayService);
  });

  it("should successfully create a Razorpay order for wallet top-up", async () => {
    // Arrange
    const input: TopUpWalletInput = {
      patientId: "patient_123",
      amount: 1000,
      customerEmail: "patient@example.com",
    };

    const mockOrder = {
      id: "order_123",
      amount: 100000, // 1000 in paise
      currency: "INR",
    };

    mockRazorpayService.createOrder.mockResolvedValue(mockOrder as any);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toEqual({
      razorpayOrderId: "order_123",
      razorpayKeyId: "rzp_test_123",
      amount: 100000,
      currency: "INR",
    });
    expect(mockRazorpayService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1000,
        currency: "inr",
        notes: {
          type: "TOP_UP",
          patientId: "patient_123",
        },
      })
    );
  });

  it("should propagate errors from Razorpay service", async () => {
    // Arrange
    mockRazorpayService.createOrder.mockRejectedValue(new Error("Razorpay API error"));

    // Act & Assert
    await expect(useCase.execute({ patientId: "id", amount: 100 })).rejects.toThrow("Razorpay API error");
  });
});
