import { CreateWalletTopUpUseCase, CreateWalletTopUpInput } from "@/application/use-cases/patient/CreateWalletTopUpUseCase";
import { PaymentGatewayFactory } from "@/infrastructure/services/PaymentGatewayFactory";
import { PaymentMethod } from "@/domain/value-objects/enums/PaymentMethod";
import { IPaymentGateway } from "@/domain/services/IPaymentGateway";

jest.mock("@/infrastructure/services/PaymentGatewayFactory");

describe("CreateWalletTopUpUseCase", () => {
  let useCase: CreateWalletTopUpUseCase;
  let mockGateway: jest.Mocked<IPaymentGateway>;

  beforeEach(() => {
    mockGateway = {
      method: PaymentMethod.STRIPE,
      createSession: jest.fn(),
      verifyWebhook: jest.fn(),
      retrieveSession: jest.fn(),
      captureOrder: jest.fn(),
      refund: jest.fn(),
    } as any;

    (PaymentGatewayFactory.getGateway as jest.Mock).mockReturnValue(mockGateway);
    useCase = new CreateWalletTopUpUseCase();
  });

  it("should successfully create a wallet top-up session", async () => {
    // Arrange
    const input: CreateWalletTopUpInput = {
      patientId: "patient_123",
      amount: 1000,
      customerEmail: "patient@example.com",
    };

    const mockSession = {
      id: "sess_123",
      url: "https://stripe.com/checkout/123",
    };

    mockGateway.createSession.mockResolvedValue(mockSession);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result).toEqual({
      sessionId: "sess_123",
      url: "https://stripe.com/checkout/123",
    });
    expect(PaymentGatewayFactory.getGateway).toHaveBeenCalledWith(PaymentMethod.STRIPE);
    expect(mockGateway.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1000,
        customerEmail: "patient@example.com",
        metadata: {
          type: "WALLET_TOPUP",
          patientId: "patient_123",
        },
      })
    );
  });

  it("should throw error if session URL is missing", async () => {
    // Arrange
    const input: CreateWalletTopUpInput = {
      patientId: "patient_123",
      amount: 1000,
    };

    mockGateway.createSession.mockResolvedValue({ id: "sess_123" }); // No URL

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow("Failed to create Stripe session URL");
  });

  it("should propagate errors from the payment gateway", async () => {
    // Arrange
    const input: CreateWalletTopUpInput = {
      patientId: "patient_123",
      amount: 1000,
    };

    mockGateway.createSession.mockRejectedValue(new Error("Stripe API error"));

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow("Stripe API error");
  });
});
