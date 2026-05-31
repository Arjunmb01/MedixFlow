import { HandleWalletWebhookUseCase } from "@/application/use-cases/patient/HandleWalletWebhookUseCase";
import { WalletService } from "@/application/services/WalletService";
import { PaymentGatewayFactory } from "@/infrastructure/services/PaymentGatewayFactory";
import { PaymentMethod } from "@/domain/value-objects/enums/PaymentMethod";
import { TransactionType } from "@/domain/value-objects/enums/TransactionType";

jest.mock("@/infrastructure/services/PaymentGatewayFactory");

describe("HandleWalletWebhookUseCase", () => {
  let useCase: HandleWalletWebhookUseCase;
  let mockWalletService: jest.Mocked<WalletService>;
  let mockGateway: any;

  beforeEach(() => {
    mockWalletService = {
      creditWallet: jest.fn(),
    } as any;

    mockGateway = {
      verifyWebhook: jest.fn(),
    };

    (PaymentGatewayFactory.getGateway as jest.Mock).mockReturnValue(mockGateway);
    useCase = new HandleWalletWebhookUseCase(mockWalletService);
  });

  it("should credit wallet on successful stripe checkout session", async () => {
    // Arrange
    const payload = { id: "evt_123" };
    const signature = "sig_123";
    const secret = "whsec_123";

    mockGateway.verifyWebhook.mockResolvedValue({
      isValid: true,
      event: "checkout.session.completed",
      data: {
        id: "sess_123",
        amount_total: 50000, // 500.00
        metadata: {
          type: "WALLET_TOPUP",
          patientId: "patient_123",
        },
      },
    });

    // Act
    await useCase.execute(payload, signature, secret);

    // Assert
    expect(mockWalletService.creditWallet).toHaveBeenCalledWith(
      "patient_123",
      500,
      TransactionType.TOP_UP,
      expect.any(String),
      "sess_123",
      expect.objectContaining({ stripeEventId: "sess_123" })
    );
  });

  it("should throw error if webhook signature is invalid", async () => {
    // Arrange
    mockGateway.verifyWebhook.mockResolvedValue({ isValid: false });

    // Act & Assert
    await expect(useCase.execute({}, "sig", "secret")).rejects.toThrow("Invalid webhook signature");
  });

  it("should ignore events other than checkout.session.completed", async () => {
    // Arrange
    mockGateway.verifyWebhook.mockResolvedValue({
      isValid: true,
      event: "payment_intent.created",
      data: {},
    });

    // Act
    await useCase.execute({}, "sig", "secret");

    // Assert
    expect(mockWalletService.creditWallet).not.toHaveBeenCalled();
  });

  it("should ignore WALLET_TOPUP sessions without correct metadata", async () => {
    // Arrange
    mockGateway.verifyWebhook.mockResolvedValue({
      isValid: true,
      event: "checkout.session.completed",
      data: {
        metadata: { type: "OTHER" },
      },
    });

    // Act
    await useCase.execute({}, "sig", "secret");

    // Assert
    expect(mockWalletService.creditWallet).not.toHaveBeenCalled();
  });
});
