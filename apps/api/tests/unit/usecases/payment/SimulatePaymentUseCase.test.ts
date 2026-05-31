import { SimulatePaymentUseCase } from "@/application/use-cases/payment/SimulatePaymentUseCase";
import { PaymentStatus } from "@/domain/value-objects/enums/PaymentStatus";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";

describe('SimulatePaymentUseCase', () => {
    let useCase: SimulatePaymentUseCase;
    let mockPaymentRepo: any;
    let mockAppointmentRepo: any;
    let mockConfirmPaymentUseCase: any;

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
        useCase = new SimulatePaymentUseCase(mockPaymentRepo, mockAppointmentRepo, mockConfirmPaymentUseCase);
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
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith('pay-1', PaymentStatus.FAILED);
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('a-1', AppointmentStatus.PAYMENT_FAILED_HOLD);
    });
});
