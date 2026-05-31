"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandlePayPalWebhookUseCase_1 = require("@/application/use-cases/payment/HandlePayPalWebhookUseCase");
const PaymentGatewayFactory_1 = require("@/infrastructure/services/PaymentGatewayFactory");
jest.mock("@/infrastructure/services/PaymentGatewayFactory");
describe("HandlePayPalWebhookUseCase", () => {
    let useCase;
    let mockPaymentRepo;
    let mockConfirmPaymentUseCase;
    let mockGateway;
    beforeEach(() => {
        mockPaymentRepo = {
            findByPayPalOrderId: jest.fn(),
        };
        mockConfirmPaymentUseCase = {
            execute: jest.fn(),
        };
        mockGateway = {
            verifyWebhook: jest.fn(),
        };
        PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway.mockReturnValue(mockGateway);
        useCase = new HandlePayPalWebhookUseCase_1.HandlePayPalWebhookUseCase(mockPaymentRepo, mockConfirmPaymentUseCase);
    });
    it("should confirm payment when CHECKOUT.ORDER.APPROVED event is received", async () => {
        // Arrange
        const payload = { event_type: "CHECKOUT.ORDER.APPROVED" };
        const signature = "sig";
        const secret = "secret";
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: { id: "ord_123" },
        });
        const mockPayment = { id: "pay_1", paypalOrderId: "ord_123" };
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue(mockPayment);
        // Act
        await useCase.execute(payload, signature, secret);
        // Assert
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalledWith({
            paymentId: "pay_1",
            gatewayData: {
                paypalOrderId: "ord_123",
            },
        });
    });
    it("should confirm payment when PAYMENT.CAPTURE.COMPLETED event is received", async () => {
        // Arrange
        const payload = { event_type: "PAYMENT.CAPTURE.COMPLETED" };
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: {
                id: "cap_123",
                supplementary_data: { related_ids: { order_id: "ord_123" } }
            },
        });
        const mockPayment = { id: "pay_1" };
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue(mockPayment);
        // Act
        await useCase.execute(payload, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalledWith({
            paymentId: "pay_1",
            gatewayData: {
                paypalOrderId: "ord_123",
                paypalCaptureId: "cap_123",
            },
        });
    });
    it("should throw error if webhook is invalid", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({ isValid: false });
        // Act & Assert
        await expect(useCase.execute({ event_type: "any" }, "sig", "secret")).rejects.toThrow("Invalid PayPal webhook");
    });
    it("should ignore events without orderId", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: {}, // No orderId
        });
        // Act
        await useCase.execute({ event_type: "CHECKOUT.ORDER.APPROVED" }, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
    });
    it("should ignore events if payment record not found", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: { id: "ord_123" },
        });
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue(null);
        // Act
        await useCase.execute({ event_type: "CHECKOUT.ORDER.APPROVED" }, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
    });
    it("should extract orderId from links when supplementary_data is missing for PAYMENT.CAPTURE.COMPLETED", async () => {
        // Arrange
        const payload = { event_type: "PAYMENT.CAPTURE.COMPLETED" };
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: {
                id: "cap_123",
                links: [{ rel: "up", href: "https://api.paypal.com/v2/checkout/orders/ABC123XYZ" }]
            },
        });
        const mockPayment = { id: "pay_1" };
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue(mockPayment);
        // Act
        await useCase.execute(payload, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            gatewayData: expect.objectContaining({ paypalOrderId: "ABC123XYZ" })
        }));
    });
    it("should log warning and return if CHECKOUT.ORDER.APPROVED has no id", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: {}, // Missing id
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        // Act
        await useCase.execute({ event_type: "CHECKOUT.ORDER.APPROVED" }, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Could not extract OrderID"));
        consoleSpy.mockRestore();
    });
    it("should do nothing for unknown event types", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: { id: "ord_123" }
        });
        // Act
        await useCase.execute({ event_type: "UNKNOWN.EVENT" }, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
    });
    it("should handle PAYMENT.CAPTURE.COMPLETED with no valid order link in links", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: {
                id: "cap_123",
                links: [{ rel: "self", href: "https://api.paypal.com/v2/payments/captures/cap_123" }]
            }
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        // Act
        await useCase.execute({ event_type: "PAYMENT.CAPTURE.COMPLETED" }, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Could not extract OrderID"));
        consoleSpy.mockRestore();
    });
    it("should handle PAYMENT.CAPTURE.COMPLETED with order link that doesn't match regex", async () => {
        // Arrange
        mockGateway.verifyWebhook.mockResolvedValue({
            isValid: true,
            data: {
                id: "cap_123",
                links: [{ rel: "up", href: "https://api.paypal.com/v2/checkout/not-orders/123" }]
            }
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        // Act
        await useCase.execute({ event_type: "PAYMENT.CAPTURE.COMPLETED" }, "sig", "secret");
        // Assert
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Could not extract OrderID"));
        consoleSpy.mockRestore();
    });
});
