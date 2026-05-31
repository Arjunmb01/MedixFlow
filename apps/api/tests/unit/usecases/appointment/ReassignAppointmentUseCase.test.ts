import { ReassignAppointmentUseCase } from "@/application/use-cases/appointment/ReassignAppointmentUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('ReassignAppointmentUseCase', () => {
    let useCase: ReassignAppointmentUseCase;
    let mockAppointmentRepo: any;
    let mockSendNotificationUseCase: any;

    const mockInput = {
        appointmentId: 'apt-1',
        newDoctorId: 'doc-new',
        reassignedBy: 'staff-1',
        reason: 'Doctor on leave'
    };

    const mockOriginal = {
        id: 'apt-1',
        patientId: 'patient-1',
        doctorId: 'doc-old'
    };

    const mockNewApt = {
        id: 'apt-new',
        appointmentDate: new Date(),
        slotStart: '10:00',
        patientId: 'patient-1',
        doctorId: 'doc-new'
    };

    beforeEach(() => {
        mockAppointmentRepo = {
            findById: jest.fn(),
            reassignAtomic: jest.fn(),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new ReassignAppointmentUseCase(mockAppointmentRepo, mockSendNotificationUseCase);
        jest.clearAllMocks();
    });

    it('should successfully reassign appointment and notify parties', async () => {
        // Arrange
        mockAppointmentRepo.findById.mockResolvedValue(mockOriginal);
        mockAppointmentRepo.reassignAtomic.mockResolvedValue(mockNewApt);

        // Act
        const result = await useCase.execute(mockInput);

        // Assert
        expect(mockAppointmentRepo.reassignAtomic).toHaveBeenCalledWith(mockInput);
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2);
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'patient-1',
            type: NotificationType.REASSIGNED
        }));
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'doc-new',
            type: NotificationType.REASSIGNED
        }));
        expect(result).toBe(mockNewApt);
    });

    it('should throw error if original appointment not found', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute(mockInput)).rejects.toThrow("Appointment not found");
    });
});
