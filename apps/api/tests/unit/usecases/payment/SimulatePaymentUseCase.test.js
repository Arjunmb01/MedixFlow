"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SimulatePaymentUseCase_1 = require("@/application/use-cases/payment/SimulatePaymentUseCase");
const PaymentStatus_1 = require("@/domain/value-objects/enums/PaymentStatus");
const AppointmentStatus_1 = require("@/domain/value-objects/enums/AppointmentStatus");
describe('SimulatePaymentUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    let mockAppointmentRepo;
    let mockConfirmPaymentUseCase;
    beforeEach(() => {
        mockPaymentRepo = {
            findByAppointmentId: jest.fn(),
            updateStatus: jest.fn().mockResolvedValue(undefined),
        };
        mockAppointmentRepo = {
            updateStatus: jest.fn().mockResolvedValue(undefined),
        };
        mockConfirmPaymentUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new SimulatePaymentUseCase_1.SimulatePaymentUseCase(mockPaymentRepo, mockAppointmentRepo, mockConfirmPaymentUseCase);
        jest.clearAllMocks();
    });
    it('should call confirmPaymentUseCase on success', async () => {
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({ id: 'pay-1' });
        await useCase.execute({ appointmentId: 'a-1', status: 'success' });
        expect(mockConfirmPaymentUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ paymentId: 'pay-1' }));
    });
    it('should update statuses to FAILED and PAYMENT_FAILED_HOLD on failure', async () => {
        mockPaymentRepo.findByAppointmentId.mockResolvedValue({ id: 'pay-1' });
        await useCase.execute({ appointmentId: 'a-1', status: 'failure' });
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith('pay-1', PaymentStatus_1.PaymentStatus.FAILED);
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('a-1', AppointmentStatus_1.AppointmentStatus.PAYMENT_FAILED_HOLD);
    });
});
