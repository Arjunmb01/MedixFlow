"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VerifyPayPalPaymentUseCase_1 = require("@/application/use-cases/payment/VerifyPayPalPaymentUseCase");
const PaymentGatewayFactory_1 = require("@/infrastructure/services/PaymentGatewayFactory");
const PaymentStatus_1 = require("@/domain/value-objects/enums/PaymentStatus");
jest.mock("@/infrastructure/services/PaymentGatewayFactory");
describe('VerifyPayPalPaymentUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    let mockConfirmPaymentUseCase;
    let mockGateway;
    beforeEach(() => {
        mockPaymentRepo = {
            findByPayPalOrderId: jest.fn(),
        };
        mockConfirmPaymentUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        mockGateway = {
            captureOrder: jest.fn(),
        };
        PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway.mockReturnValue(mockGateway);
        useCase = new VerifyPayPalPaymentUseCase_1.VerifyPayPalPaymentUseCase(mockPaymentRepo, mockConfirmPaymentUseCase);
        jest.clearAllMocks();
    });
    it('should successfully verify and confirm PayPal payment', async () => {
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.captureOrder.mockResolvedValue({ status: 'COMPLETED', id: 'cap-1' });
        const result = await useCase.execute('order-1');
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            paymentId: 'p-1',
            gatewayData: { paypalCaptureId: 'cap-1', paypalOrderId: 'order-1' }
        }));
        expect(result.success).toBe(true);
    });
    it('should return success if already PAID', async () => {
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue({ id: 'p-1', status: PaymentStatus_1.PaymentStatus.PAID });
        const result = await useCase.execute('order-1');
        expect(result.success).toBe(true);
        expect(mockGateway.captureOrder).not.toHaveBeenCalled();
    });
    it('should throw error if payment record not found', async () => {
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue(null);
        await expect(useCase.execute('none')).rejects.toThrow("Payment record not found");
    });
    it("should return failure if PayPal capture status is not COMPLETED or APPROVED", async () => {
        // Arrange
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.captureOrder.mockResolvedValue({ status: 'FAILED' });
        // Act
        const result = await useCase.execute('order-1');
        // Assert
        expect(result.success).toBe(false);
        expect(result.status).toBe('FAILED');
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
    });
    it("should successfully verify when status is APPROVED", async () => {
        // Arrange
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.captureOrder.mockResolvedValue({ status: 'APPROVED', id: 'ord-1' });
        // Act
        const result = await useCase.execute('order-1');
        // Assert
        expect(result.success).toBe(true);
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalled();
    });
    it("should extract captureId from nested purchaseUnits structure", async () => {
        // Arrange
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        const nestedResult = {
            status: 'COMPLETED',
            purchaseUnits: [{
                    payments: {
                        captures: [{ id: 'NESTED_CAP_ID' }]
                    }
                }]
        };
        mockGateway.captureOrder.mockResolvedValue(nestedResult);
        // Act
        await useCase.execute('order-1');
        // Assert
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            gatewayData: expect.objectContaining({ paypalCaptureId: 'NESTED_CAP_ID' })
        }));
    });
    it("should fallback to payment record status if PayPal result is missing status", async () => {
        // Arrange
        mockPaymentRepo.findByPayPalOrderId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        mockGateway.captureOrder.mockResolvedValue({ some_other_field: 'value' });
        // Act
        const result = await useCase.execute('order-1');
        // Assert
        expect(result.success).toBe(false);
        expect(result.status).toBe('PENDING');
    });
});
