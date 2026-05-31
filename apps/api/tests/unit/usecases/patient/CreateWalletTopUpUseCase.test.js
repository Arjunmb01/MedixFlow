"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CreateWalletTopUpUseCase_1 = require("@/application/use-cases/patient/CreateWalletTopUpUseCase");
const PaymentGatewayFactory_1 = require("@/infrastructure/services/PaymentGatewayFactory");
const PaymentMethod_1 = require("@/domain/value-objects/enums/PaymentMethod");
jest.mock("@/infrastructure/services/PaymentGatewayFactory");
describe("CreateWalletTopUpUseCase", () => {
    let useCase;
    let mockGateway;
    beforeEach(() => {
        mockGateway = {
            method: PaymentMethod_1.PaymentMethod.STRIPE,
            createSession: jest.fn(),
            verifyWebhook: jest.fn(),
            retrieveSession: jest.fn(),
            captureOrder: jest.fn(),
            refund: jest.fn(),
        };
        PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway.mockReturnValue(mockGateway);
        useCase = new CreateWalletTopUpUseCase_1.CreateWalletTopUpUseCase();
    });
    it("should successfully create a wallet top-up session", async () => {
        // Arrange
        const input = {
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
        expect(PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway).toHaveBeenCalledWith(PaymentMethod_1.PaymentMethod.STRIPE);
        expect(mockGateway.createSession).toHaveBeenCalledWith(expect.objectContaining({
            amount: 1000,
            customerEmail: "patient@example.com",
            metadata: {
                type: "WALLET_TOPUP",
                patientId: "patient_123",
            },
        }));
    });
    it("should throw error if session URL is missing", async () => {
        // Arrange
        const input = {
            patientId: "patient_123",
            amount: 1000,
        };
        mockGateway.createSession.mockResolvedValue({ id: "sess_123" }); // No URL
        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow("Failed to create Stripe session URL");
    });
    it("should propagate errors from the payment gateway", async () => {
        // Arrange
        const input = {
            patientId: "patient_123",
            amount: 1000,
        };
        mockGateway.createSession.mockRejectedValue(new Error("Stripe API error"));
        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow("Stripe API error");
    });
});
