"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandleStripeWebhookUseCase_1 = require("@/application/use-cases/payment/HandleStripeWebhookUseCase");
const PaymentGatewayFactory_1 = require("@/infrastructure/services/PaymentGatewayFactory");
const PaymentStatus_1 = require("@/domain/value-objects/enums/PaymentStatus");
const AppointmentStatus_1 = require("@/domain/value-objects/enums/AppointmentStatus");
const TransactionType_1 = require("@/domain/value-objects/enums/TransactionType");
jest.mock("@/infrastructure/services/PaymentGatewayFactory");
describe("HandleStripeWebhookUseCase", () => {
    let useCase;
    let mockPaymentRepo;
    let mockAppointmentRepo;
    let mockConfirmPaymentUseCase;
    let mockWalletService;
    let mockGateway;
    beforeEach(() => {
        mockPaymentRepo = { findByStripeSessionId: jest.fn(), updateStatus: jest.fn() };
        mockAppointmentRepo = { updateStatus: jest.fn() };
        mockConfirmPaymentUseCase = { execute: jest.fn() };
        mockWalletService = { creditWallet: jest.fn() };
        mockGateway = { verifyWebhook: jest.fn() };
        PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway.mockReturnValue(mockGateway);
        useCase = new HandleStripeWebhookUseCase_1.HandleStripeWebhookUseCase(mockPaymentRepo, mockAppointmentRepo, mockConfirmPaymentUseCase, mockWalletService);
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
        expect(mockWalletService.creditWallet).toHaveBeenCalledWith("p1", 1000, TransactionType_1.TransactionType.TOP_UP, expect.any(String), "sess_123", expect.any(Object));
    });
    it("should confirm payment for appointment session completed", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            event: "checkout.session.completed",
            data: { id: "sess_123", payment_intent: "pi_123", metadata: {} }
        });
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: "pay_1", status: PaymentStatus_1.PaymentStatus.PENDING });
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
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: "pay_1", appointmentId: "app_1" });
        // Act
        await useCase.execute({}, "sig", "secret");
        // Assert
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith("pay_1", PaymentStatus_1.PaymentStatus.FAILED);
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith("app_1", AppointmentStatus_1.AppointmentStatus.PAYMENT_FAILED_HOLD);
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
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ status: PaymentStatus_1.PaymentStatus.PAID });
        await useCase.execute({}, "sig", "secret");
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
    });
});
