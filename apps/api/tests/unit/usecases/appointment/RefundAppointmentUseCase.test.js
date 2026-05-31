"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RefundAppointmentUseCase_1 = require("@/application/use-cases/appointment/RefundAppointmentUseCase");
const PaymentStatus_1 = require("@/domain/value-objects/enums/PaymentStatus");
const PaymentMethod_1 = require("@/domain/value-objects/enums/PaymentMethod");
const TransactionType_1 = require("@/domain/value-objects/enums/TransactionType");
const PaymentGatewayFactory_1 = require("@/infrastructure/services/PaymentGatewayFactory");
jest.mock("@/infrastructure/services/PaymentGatewayFactory");
describe('RefundAppointmentUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    let mockWalletRepo;
    let mockAppointmentRepo;
    let mockRazorpayService;
    beforeEach(() => {
        mockPaymentRepo = {
            findByAppointmentId: jest.fn(),
            updateStatus: jest.fn(),
        };
        mockWalletRepo = {
            findByPatientId: jest.fn(),
            updateBalance: jest.fn(),
        };
        mockAppointmentRepo = {
            updatePaymentStatus: jest.fn(),
        };
        mockRazorpayService = {
            refundPayment: jest.fn(),
        };
        useCase = new RefundAppointmentUseCase_1.RefundAppointmentUseCase(mockPaymentRepo, mockWalletRepo, mockAppointmentRepo, mockRazorpayService);
        jest.clearAllMocks();
    });
    it('should exit early if no paid payment found', async () => {
        mockPaymentRepo.findByAppointmentId.mockResolvedValue(null);
        await useCase.execute('apt-1', 'pat-1', true);
        expect(mockWalletRepo.updateBalance).not.toHaveBeenCalled();
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({ status: PaymentStatus_1.PaymentStatus.PENDING });
        await useCase.execute('apt-1', 'pat-1', true);
        expect(mockWalletRepo.updateBalance).not.toHaveBeenCalled();
    });
    it('should throw error if wallet not found', async () => {
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({ status: PaymentStatus_1.PaymentStatus.PAID, amount: 500 });
        mockWalletRepo.findByPatientId.mockResolvedValue(null);
        await expect(useCase.execute('apt-1', 'pat-1', true))
            .rejects.toThrow("Patient wallet not found for refund");
    });
    it('should refund everything to wallet if refundToWallet is true', async () => {
        // Arrange
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({
            id: 'pay-1',
            status: PaymentStatus_1.PaymentStatus.PAID,
            amount: 450,
            walletAmount: 50
        });
        mockWalletRepo.findByPatientId.mockResolvedValue({ id: 'wal-1' });
        // Act
        await useCase.execute('apt-1', 'pat-1', true);
        // Assert
        const totalPaid = 500;
        const expectedRefund = totalPaid - 50; // 450
        expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith('wal-1', expectedRefund, TransactionType_1.TransactionType.REFUND, expect.stringContaining('apt-1'));
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith('pay-1', PaymentStatus_1.PaymentStatus.REFUNDED);
        expect(mockAppointmentRepo.updatePaymentStatus).toHaveBeenCalledWith('apt-1', PaymentStatus_1.PaymentStatus.REFUNDED);
    });
    it('should refund to gateway and wallet if refundToWallet is false', async () => {
        // Arrange
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({
            id: 'pay-1',
            status: PaymentStatus_1.PaymentStatus.PAID,
            amount: 400,
            walletAmount: 100,
            paymentMethod: PaymentMethod_1.PaymentMethod.STRIPE,
            stripePaymentIntentId: 'pi-1'
        });
        mockWalletRepo.findByPatientId.mockResolvedValue({ id: 'wal-1' });
        const mockGateway = { refund: jest.fn() };
        PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway.mockReturnValue(mockGateway);
        // Act
        await useCase.execute('apt-1', 'pat-1', false);
        // Assert
        // Total Paid: 500. Refund after fee: 450.
        // Gateway Refund: Math.min(400, 450) = 400.
        // Wallet Refund: 450 - 400 = 50.
        expect(mockGateway.refund).toHaveBeenCalledWith('pi-1', 400);
        expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith('wal-1', 50, TransactionType_1.TransactionType.REFUND, expect.any(String));
    });
    it('should handle Razorpay refund', async () => {
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({
            id: 'pay-1',
            status: PaymentStatus_1.PaymentStatus.PAID,
            amount: 500,
            paymentMethod: PaymentMethod_1.PaymentMethod.RAZORPAY,
            razorpayPaymentId: 'rp-1'
        });
        mockWalletRepo.findByPatientId.mockResolvedValue({ id: 'wal-1' });
        await useCase.execute('apt-1', 'pat-1', false);
        expect(mockRazorpayService.refundPayment).toHaveBeenCalledWith('rp-1', 450);
    });
});
