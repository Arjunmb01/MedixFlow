"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VerifyRazorpayPaymentUseCase_1 = require("@/application/use-cases/payment/VerifyRazorpayPaymentUseCase");
const PaymentStatus_1 = require("@/domain/value-objects/enums/PaymentStatus");
describe('VerifyRazorpayPaymentUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    let mockRazorpayService;
    let mockConfirmPaymentUseCase;
    beforeEach(() => {
        mockPaymentRepo = {
            findByOrderId: jest.fn(),
        };
        mockRazorpayService = {
            verifyPaymentSignature: jest.fn(),
        };
        mockConfirmPaymentUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new VerifyRazorpayPaymentUseCase_1.VerifyRazorpayPaymentUseCase(mockPaymentRepo, mockRazorpayService, mockConfirmPaymentUseCase);
        jest.clearAllMocks();
    });
    it('should successfully verify and confirm Razorpay payment', async () => {
        mockRazorpayService.verifyPaymentSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ id: 'p-1', status: 'PENDING' });
        const result = await useCase.execute({
            razorpayOrderId: 'order-1',
            razorpayPaymentId: 'pay-1',
            razorpaySignature: 'sig-1'
        });
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });
    it('should throw error if signature invalid', async () => {
        mockRazorpayService.verifyPaymentSignature.mockReturnValue(false);
        await expect(useCase.execute({
            razorpayOrderId: 'o-1',
            razorpayPaymentId: 'p-1',
            razorpaySignature: 's-1'
        })).rejects.toThrow("Invalid Razorpay payment signature");
    });
    it("should throw error if payment record is not found", async () => {
        // Arrange
        mockRazorpayService.verifyPaymentSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue(null);
        // Act & Assert
        await expect(useCase.execute({
            razorpayOrderId: 'order_missing',
            razorpayPaymentId: 'pay_1',
            razorpaySignature: 'sig_1'
        })).rejects.toThrow("Payment record not found");
    });
    it("should return success if payment is already PAID", async () => {
        // Arrange
        mockRazorpayService.verifyPaymentSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ status: PaymentStatus_1.PaymentStatus.PAID });
        // Act
        const result = await useCase.execute({
            razorpayOrderId: 'order_paid',
            razorpayPaymentId: 'pay_1',
            razorpaySignature: 'sig_1'
        });
        // Assert
        expect(result.success).toBe(true);
        expect(mockConfirmPaymentUseCase.execute).not.toHaveBeenCalled();
    });
});
