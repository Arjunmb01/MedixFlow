import { ConfirmPaymentUseCase } from "@/application/use-cases/payment/confirmPayment.usecase";
import { PaymentStatus } from "@/domain/value-objects/enums/PaymentStatus";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('ConfirmPaymentUseCase', () => {
    let useCase: ConfirmPaymentUseCase;
    let mockPaymentRepo: any;
    let mockAppointmentRepo: any;
    let mockQueueService: any;
    let mockSocketService: any;
    let mockSendNotificationUseCase: any;

    beforeEach(() => {
        mockPaymentRepo = {
            updateStatus: jest.fn().mockResolvedValue({ id: 'pay-1', appointmentId: 'a-1' }),
        };
        mockAppointmentRepo = {
            findById: jest.fn().mockResolvedValue({ 
                id: 'a-1', 
                status: 'PENDING', 
                doctorId: 'd-1', 
                patientId: 'p-1',
                appointmentDate: new Date(),
                slotStart: '10:00',
                patient: { firstName: 'John' }
            }),
            updateStatus: jest.fn().mockResolvedValue(undefined),
            updatePaymentStatus: jest.fn().mockResolvedValue(undefined),
            updateQueuePosition: jest.fn().mockResolvedValue(undefined),
            getTodaysQueue: jest.fn().mockResolvedValue([]),
        };
        mockQueueService = {
            addToQueue: jest.fn().mockResolvedValue(5),
        };
        mockSocketService = {
            emitAppointmentBooked: jest.fn(),
            emitQueueUpdated: jest.fn(),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new ConfirmPaymentUseCase(
            mockPaymentRepo,
            mockAppointmentRepo,
            mockQueueService,
            mockSocketService,
            mockSendNotificationUseCase
        );
        jest.clearAllMocks();
    });

    it('should successfully confirm payment and update appointment state', async () => {
        await useCase.execute({ paymentId: 'pay-1', gatewayData: { paypalOrderId: 'order-1' } });

        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith('pay-1', PaymentStatus.PAID, expect.anything());
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('a-1', AppointmentStatus.BOOKED);
        expect(mockQueueService.addToQueue).toHaveBeenCalled();
        expect(mockAppointmentRepo.updateQueuePosition).toHaveBeenCalledWith('a-1', 5);
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2); // Doctor and Patient
    });

    it('should skip if appointment already BOOKED', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', status: AppointmentStatus.BOOKED });
        await useCase.execute({ paymentId: 'pay-1', gatewayData: {} });
        expect(mockAppointmentRepo.updateStatus).not.toHaveBeenCalled();
    });
});
