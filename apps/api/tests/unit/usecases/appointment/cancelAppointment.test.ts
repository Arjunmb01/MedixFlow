import { CancelAppointmentUseCase } from "@/application/use-cases/appointment/cancelAppointment.usecase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";

describe('CancelAppointmentUseCase', () => {
    let useCase: CancelAppointmentUseCase;
    let mockAppointmentRepo: any;
    let mockConsultationRepo: any;
    let mockSendNotificationUseCase: any;
    let mockPaymentRepo: any;
    let mockRazorpayService: any;
    let mockWalletRepo: any;
    let mockQueueService: any;
    let mockSocketService: any;
    let mockRefundAppointmentUseCase: any;

    const mockAppointment = {
        id: 'apt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        appointmentDate: new Date(),
        slotStart: '10:00',
        status: 'PENDING'
    };

    beforeEach(() => {
        mockAppointmentRepo = {
            findById: jest.fn(),
            cancelAppointment: jest.fn(),
            createAuditLog: jest.fn(),
            getTodaysQueue: jest.fn(),
        };
        mockConsultationRepo = {
            deleteByAppointmentId: jest.fn(),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        mockPaymentRepo = {};
        mockRazorpayService = {};
        mockWalletRepo = {};
        mockQueueService = {
            removeFromQueue: jest.fn(),
        };
        mockSocketService = {
            emitQueueUpdated: jest.fn(),
            emitStatusChanged: jest.fn(),
        };
        mockRefundAppointmentUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };

        useCase = new CancelAppointmentUseCase(
            mockAppointmentRepo,
            mockConsultationRepo,
            mockSendNotificationUseCase,
            mockPaymentRepo as any,
            mockRazorpayService as any,
            mockWalletRepo as any,
            mockQueueService,
            mockSocketService,
            mockRefundAppointmentUseCase
        );

        jest.clearAllMocks();
    });

    it('should successfully cancel an appointment', async () => {
        // Arrange
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.cancelAppointment.mockResolvedValue({ ...mockAppointment, status: 'CANCELLED' });
        mockAppointmentRepo.getTodaysQueue.mockResolvedValue([]);

        // Act
        const result = await useCase.execute('apt-1', 'patient-1', 'Personal reason');

        // Assert
        expect(mockAppointmentRepo.cancelAppointment).toHaveBeenCalledWith('apt-1', 'Personal reason');
        expect(mockAppointmentRepo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({
            action: 'CANCELLED',
            actorId: 'patient-1'
        }));
        expect(mockConsultationRepo.deleteByAppointmentId).toHaveBeenCalledWith('apt-1');
        expect(mockRefundAppointmentUseCase.execute).toHaveBeenCalledWith('apt-1', 'patient-1', false);
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2);
        expect(mockQueueService.removeFromQueue).toHaveBeenCalled();
        expect(result.status).toBe('CANCELLED');
    });

    it('should throw error if appointment not found', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('apt-1', 'patient-1', 'reason'))
            .rejects.toThrow("Appointment not found");
    });

    it('should throw error if unauthorized', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        await expect(useCase.execute('apt-1', 'wrong-patient', 'reason'))
            .rejects.toThrow("Unauthorized to cancel to this appointment");
    });

    it('should allow system action without patientId match', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.cancelAppointment.mockResolvedValue({ ...mockAppointment, status: 'CANCELLED' });
        
        await useCase.execute('apt-1', 'some-id', 'System cancel', false, true);
        
        expect(mockAppointmentRepo.cancelAppointment).toHaveBeenCalled();
    });

    it('should throw error if status is already CANCELLED or COMPLETED', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ ...mockAppointment, status: 'CANCELLED' });
        await expect(useCase.execute('apt-1', 'patient-1', 'reason'))
            .rejects.toThrow("Cannot cancel appointment with status CANCELLED");

        mockAppointmentRepo.findById.mockResolvedValue({ ...mockAppointment, status: 'COMPLETED' });
        await expect(useCase.execute('apt-1', 'patient-1', 'reason'))
            .rejects.toThrow("Cannot cancel appointment with status COMPLETED");
    });

    it('should handle refund to wallet if requested', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.cancelAppointment.mockResolvedValue({ ...mockAppointment, status: 'CANCELLED' });

        await useCase.execute('apt-1', 'patient-1', 'reason', true);

        expect(mockRefundAppointmentUseCase.execute).toHaveBeenCalledWith('apt-1', 'patient-1', true);
    });
});
