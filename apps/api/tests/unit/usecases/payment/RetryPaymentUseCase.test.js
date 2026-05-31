"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RetryPaymentUseCase_1 = require("@/application/use-cases/payment/RetryPaymentUseCase");
const PaymentMethod_1 = require("@/domain/value-objects/enums/PaymentMethod");
const AppointmentStatus_1 = require("@/domain/value-objects/enums/AppointmentStatus");
const PaymentGatewayFactory_1 = require("@/infrastructure/services/PaymentGatewayFactory");
jest.mock("@/infrastructure/services/PaymentGatewayFactory");
describe('RetryPaymentUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    let mockAppointmentRepo;
    let mockPatientRepo;
    let mockGateway;
    beforeEach(() => {
        mockPaymentRepo = {
            findByAppointmentId: jest.fn(),
            updateStatus: jest.fn().mockResolvedValue(undefined),
        };
        mockAppointmentRepo = {
            findById: jest.fn(),
        };
        mockPatientRepo = {
            findById: jest.fn(),
        };
        mockGateway = {
            createSession: jest.fn().mockResolvedValue({ id: 'sess-1', url: 'http://stripe.url' }),
        };
        PaymentGatewayFactory_1.PaymentGatewayFactory.getGateway.mockReturnValue(mockGateway);
        useCase = new RetryPaymentUseCase_1.RetryPaymentUseCase(mockPaymentRepo, mockAppointmentRepo, mockPatientRepo);
        jest.clearAllMocks();
    });
    it('should successfully retry Stripe payment', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', status: AppointmentStatus_1.AppointmentStatus.PENDING, patientId: 'p-1' });
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({ id: 'pay-1', paymentMethod: PaymentMethod_1.PaymentMethod.STRIPE, amount: 100, currency: 'USD' });
        mockPatientRepo.findById.mockResolvedValue({ email: 'test@test.com' });
        const result = await useCase.execute({ appointmentId: 'a-1' });
        expect(mockGateway.createSession).toHaveBeenCalled();
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalled();
        expect(result.stripeUrl).toBe('http://stripe.url');
    });
    it('should throw error if appointment status is not retryable', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', status: AppointmentStatus_1.AppointmentStatus.BOOKED });
        await expect(useCase.execute({ appointmentId: 'a-1' }))
            .rejects.toThrow("Cannot retry payment");
    });
    it("should throw error for unsupported retry payment methods", async () => {
        // Arrange
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', status: AppointmentStatus_1.AppointmentStatus.PENDING });
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({ id: 'pay-1', paymentMethod: 'RAZORPAY' });
        // Act & Assert
        await expect(useCase.execute({ appointmentId: 'a-1' }))
            .rejects.toThrow("Retry not implemented for RAZORPAY");
    });
    it("should throw error if payment record is not found", async () => {
        // Arrange
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', status: AppointmentStatus_1.AppointmentStatus.PENDING });
        mockPaymentRepo.findByAppointmentId.mockResolvedValue(null);
        // Act & Assert
        await expect(useCase.execute({ appointmentId: 'a-1' }))
            .rejects.toThrow("Payment record not found");
    });
});
