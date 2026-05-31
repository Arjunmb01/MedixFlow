import { HandleStripeWebhookUseCase } from "@/application/use-cases/payment/HandleStripeWebhookUseCase";
import { IPaymentRepository } from "@/domain/repositories/IPaymentRepository";
import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { ConfirmPaymentUseCase } from "@/application/use-cases/payment/confirmPayment.usecase";
import { WalletService } from "@/application/services/WalletService";
import { PaymentGatewayFactory } from "@/infrastructure/services/PaymentGatewayFactory";
import { PaymentMethod } from "@/domain/value-objects/enums/PaymentMethod";
import { PaymentStatus } from "@/domain/value-objects/enums/PaymentStatus";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";
import { TransactionType } from "@/domain/value-objects/enums/TransactionType";

jest.mock("@/infrastructure/services/PaymentGatewayFactory");

describe("HandleStripeWebhookUseCase", () => {
  let useCase: HandleStripeWebhookUseCase;
  let mockPaymentRepo: jest.Mocked<IPaymentRepository>;
  let mockAppointmentRepo: jest.Mocked<IAppointmentRepository>;
  let mockConfirmPaymentUseCase: jest.Mocked<ConfirmPaymentUseCase>;
  let mockWalletService: jest.Mocked<WalletService>;
  let mockGateway: any;

  beforeEach(() => {
    mockPaymentRepo = { findByStripeSessionId: jest.fn(), updateStatus: jest.fn() } as any;
    mockAppointmentRepo = { updateStatus: jest.fn() } as any;
    mockConfirmPaymentUseCase = { execute: jest.fn() } as any;
    mockWalletService = { creditWallet: jest.fn() } as any;
    
    mockGateway = { verifyWebhook: jest.fn() };
    (PaymentGatewayFactory.getGateway as jest.Mock).mockReturnValue(mockGateway);

    useCase = new HandleStripeWebhookUseCase(
      mockPaymentRepo,
      mockAppointmentRepo,
      mockConfirmPaymentUseCase,
      mockWalletService
    );
  });

  it("should handle WALLET_TOPUP session completed", async () => {
    // Arrange
    mockGateway.verifyWebhook.mockResolvedValue({
      isValid: true,
      event: "checkout.session.completed",
      data: {
        id: "sess_123",
        amount_total: 100000,
        metadata: { type: "WALLET_TOPUP", patientId: "p1" }
      }
    });

    // Act
    await useCase.execute({}, "sig", "secret");

    // Assert
    expect(mockWalletService.creditWallet).toHaveBeenCalledWith(
      "p1", 1000, TransactionType.TOP_UP, expect.any(String), "sess_123", expect.any(Object)
    );
  });

  it("should confirm payment for appointment session completed", async () => {
    // Arrange
    mockGateway.verifyWebhook.mockResolvedValue({
      isValid: true,
      event: "checkout.session.completed",
      data: { id: "sess_123", payment_intent: "pi_123", metadata: {} }
    });
    mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: "pay_1", status: PaymentStatus.PENDING } as any);

    // Act
    await useCase.execute({}, "sig", "secret");

    // Assert
    expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalledWith({
      paymentId: "pay_1",
      gatewayData: { stripePaymentIntentId: "pi_123", stripeSessionId: "sess_123" }
    });
  });

  it("should handle payment failure events", async () => {
    // Arrange
    mockGateway.verifyWebhook.mockResolvedValue({
      isValid: true,
      event: "checkout.session.expired",
      data: { id: "sess_123" }
    });
    mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: "pay_1", appointmentId: "app_1" } as any);

    // Act
    await useCase.execute({}, "sig", "secret");

    // Assert
    expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith("pay_1", PaymentStatus.FAILED);
    expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith("app_1", AppointmentStatus.PAYMENT_FAILED_HOLD);
  });

  it("should throw error if signature is invalid", async () => {
    mockGateway.verifyWebhook.mockResolvedValue({ isValid: false });
    await expect(useCase.execute({}, "sig", "secret")).rejects.toThrow("Invalid Stripe webhook signature");
  });

  it("should ignore already paid payments", async () => {
    mockGateway.verifyWebhook.mockResolvedValue({
      isValid: true,
      event: "checkout.session.completed",
      data: { id: "sess_123" }
    });
    mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ status: PaymentStatus.PAID } as any);

    await useCase.execute({}, "sig", "secret");
    expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
  });
});
