import { CompleteConsultationUseCase } from "@/application/use-cases/consultation/completeConsultation.usecase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('CompleteConsultationUseCase', () => {
    let useCase: CompleteConsultationUseCase;
    let mockConsultationRepo: any;
    let mockAppointmentRepo: any;
    let mockSendNotificationUseCase: any;

    const mockConsultation = {
        id: 'c-1',
        doctorId: 'd-1',
        patientId: 'p-1',
        appointmentId: 'a-1',
        status: 'IN_PROGRESS'
    };

    beforeEach(() => {
        mockConsultationRepo = {
            findById: jest.fn(),
            saveConsultationData: jest.fn().mockResolvedValue(undefined),
            updateStatus: jest.fn().mockResolvedValue(undefined),
        };
        mockAppointmentRepo = {
            updateStatus: jest.fn().mockResolvedValue(undefined),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new CompleteConsultationUseCase(
            mockConsultationRepo,
            mockAppointmentRepo,
            mockSendNotificationUseCase
        );
        jest.clearAllMocks();
    });

    it('should successfully complete consultation and save data', async () => {
        mockConsultationRepo.findById.mockResolvedValue(mockConsultation);

        await useCase.execute('c-1', 'd-1', { weight: 70 }, { diagnosis: 'Cold', symptoms: 'Fever' }, { medicines: [] });

        expect(mockConsultationRepo.saveConsultationData).toHaveBeenCalled();
        expect(mockConsultationRepo.updateStatus).toHaveBeenCalledWith('c-1', 'COMPLETED');
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('a-1', 'COMPLETED');
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'p-1',
            type: NotificationType.COMPLETED
        }));
    });

    it('should throw error if unauthorized doctor', async () => {
        mockConsultationRepo.findById.mockResolvedValue(mockConsultation);
        await expect(useCase.execute('c-1', 'wrong-doctor'))
            .rejects.toThrow("Unauthorized to modify this consultation");
    });

    it('should not update statuses if consultation already COMPLETED', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ ...mockConsultation, status: 'COMPLETED' });

        await useCase.execute('c-1', 'd-1', { weight: 70 });

        expect(mockConsultationRepo.saveConsultationData).toHaveBeenCalled();
        expect(mockConsultationRepo.updateStatus).not.toHaveBeenCalled();
        expect(mockAppointmentRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should send prescription notification if prescription is provided', async () => {
        mockConsultationRepo.findById.mockResolvedValue(mockConsultation);

        await useCase.execute('c-1', 'd-1', undefined, undefined, { medicines: ['Paracetamol'] } as any);

        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            type: NotificationType.PRESCRIPTION
        }));
    });
});
