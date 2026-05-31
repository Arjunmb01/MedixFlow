"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VerifyStripePaymentUseCase_1 = require("@/application/use-cases/payment/VerifyStripePaymentUseCase");
const PaymentGatewayFactory_1 = require("@/infrastructure/services/PaymentGatewayFactory");
jest.mock("@/infrastructure/services/PaymentGatewayFactory");
describe('VerifyStripePaymentUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    let mockConfirmPaymentUseCase;
    let mockGateway;
    beforeEach(() => {
        mockPaymentRepo = {
            findByStripeSessionId: jest.fn(),
        };
        mockConfirmPaymentUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        mockGateway = {
            retrieveSession: jest.fn(),
        };
        PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway.mockReturnValue(mockGateway);
        useCase = new VerifyStripePaymentUseCase_1.VerifyStripePaymentUseCase(mockPaymentRepo, mockConfirmPaymentUseCase);
        jest.clearAllMocks();
    });
    it('should successfully verify and confirm Stripe payment', async () => {
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.retrieveSession.mockResolvedValue({ payment_status: 'paid', status: 'complete', payment_intent: 'pi-1' });
        const result = await useCase.execute('session-1');
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });
    it('should return failure if payment status is not paid', async () => {
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.retrieveSession.mockResolvedValue({ payment_status: 'unpaid' });
        const result = await useCase.execute('session-1');
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
        expect(result.success).toBe(false);
    });
    it('should return failure if session status is expired', async () => {
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.retrieveSession.mockResolvedValue({ status: 'expired' });
        const result = await useCase.execute('session-1');
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
        expect(result.success).toBe(false);
    });
    it('should throw error if payment record not found', async () => {
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue(null);
        await expect(useCase.execute('session-1')).rejects.toThrow("Payment record not found");
    });
    it('should propagate gateway errors (retry scenario)', async () => {
        mockPaymentRepo.findByStripeSessionId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.retrieveSession.mockRejectedValue(new Error("Stripe API down"));
        await expect(useCase.execute('session-1')).rejects.toThrow("Stripe API down");
    });
});
