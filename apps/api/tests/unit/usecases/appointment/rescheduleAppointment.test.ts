import { RescheduleAppointmentUseCase } from "@/application/use-cases/appointment/rescheduleAppointment.usecase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('RescheduleAppointmentUseCase', () => {
    let useCase: RescheduleAppointmentUseCase;
    let mockAppointmentRepo: any;
    let mockSchedulingPolicy: any;
    let mockDateTimeService: any;
    let mockSendNotificationUseCase: any;

    const mockAppointment = {
        id: 'apt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        status: 'BOOKED',
        startTime: new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours from now
    };

    const mockInput = {
        appointmentId: 'apt-1',
        callerId: 'patient-1',
        callerRole: 'patient' as const,
        newDate: new Date(Date.now() + 86400000),
        slotStart: '11:00',
        slotEnd: '11:30'
    };

    beforeEach(() => {
        mockAppointmentRepo = {
            findById: jest.fn(),
            createRescheduleProposal: jest.fn(),
            rescheduleAtomic: jest.fn(),
        };
        mockSchedulingPolicy = {};
        mockDateTimeService = {
            now: jest.fn().mockReturnValue(new Date()),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new RescheduleAppointmentUseCase(
            mockAppointmentRepo,
            mockSchedulingPolicy as any,
            mockDateTimeService,
            mockSendNotificationUseCase
        );
        jest.clearAllMocks();
    });

    it('should successfully reschedule when initiated by patient', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.rescheduleAtomic.mockResolvedValue({ ...mockAppointment, slotStart: '11:00' });

        const result = await useCase.execute(mockInput);

        expect(mockAppointmentRepo.rescheduleAtomic).toHaveBeenCalled();
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2);
        expect((result as any).slotStart).toBe('11:00');
    });

    it('should create a proposal when initiated by doctor', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.createRescheduleProposal.mockResolvedValue({ id: 'prop-1' });

        const result = await useCase.execute({
            ...mockInput,
            callerId: 'doctor-1',
            callerRole: 'doctor'
        });

        expect(mockAppointmentRepo.createRescheduleProposal).toHaveBeenCalled();
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'patient-1',
            type: NotificationType.RESCHEDULE_PROPOSAL
        }));
        expect(result.status).toBe('PROPOSED');
    });

    it('should throw error if patient reschedules less than 2 hours before', async () => {
        const soonApt = {
            ...mockAppointment,
            startTime: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
        };
        mockAppointmentRepo.findById.mockResolvedValue(soonApt);

        await expect(useCase.execute(mockInput))
            .rejects.toThrow("Rescheduling is only allowed at least 2 hours before");
    });

    it('should throw error if status is invalid', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ ...mockAppointment, status: 'CANCELLED' });
        await expect(useCase.execute(mockInput))
            .rejects.toThrow("Cannot reschedule an appointment with status CANCELLED");
    });

    it('should handle repository errors (slot full)', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.rescheduleAtomic.mockRejectedValue(new Error("SLOT_FULL"));

        await expect(useCase.execute(mockInput))
            .rejects.toThrow("Selected slot is no longer available");
    });

    it('should throw error if unauthorized patient', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        await expect(useCase.execute({ ...mockInput, callerId: 'wrong-patient' }))
            .rejects.toThrow("Unauthorized");
    });
});
