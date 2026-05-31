"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const confirmPayment_usecase_1 = require("@/application/use-cases/payment/confirmPayment.usecase");
const PaymentStatus_1 = require("@/domain/value-objects/enums/PaymentStatus");
const AppointmentStatus_1 = require("@/domain/value-objects/enums/AppointmentStatus");
describe('ConfirmPaymentUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    let mockAppointmentRepo;
    let mockQueueService;
    let mockSocketService;
    let mockSendNotificationUseCase;
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
        useCase = new confirmPayment_usecase_1.ConfirmPaymentUseCase(mockPaymentRepo, mockAppointmentRepo, mockQueueService, mockSocketService, mockSendNotificationUseCase);
        jest.clearAllMocks();
    });
    it('should successfully confirm payment and update appointment state', async () => {
        await useCase.execute({ paymentId: 'pay-1', gatewayData: { paypalOrderId: 'order-1' } });
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith('pay-1', PaymentStatus_1.PaymentStatus.PAID, expect.anything());
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('a-1', AppointmentStatus_1.AppointmentStatus.BOOKED);
        expect(mockQueueService.addToQueue).toHaveBeenCalled();
        expect(mockAppointmentRepo.updateQueuePosition).toHaveBeenCalledWith('a-1', 5);
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2); // Doctor and Patient
    });
    it('should skip if appointment already BOOKED', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', status: AppointmentStatus_1.AppointmentStatus.BOOKED });
        await useCase.execute({ paymentId: 'pay-1', gatewayData: {} });
        expect(mockAppointmentRepo.updateStatus).not.toHaveBeenCalled();
    });
});
