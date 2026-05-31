import { UpdateAppointmentStatusUseCase } from "@/application/use-cases/appointment/updateAppointmentStatus.usecase";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";

describe('UpdateAppointmentStatusUseCase', () => {
    let useCase: UpdateAppointmentStatusUseCase;
    let mockAppointmentRepo: any;
    let mockQueueService: any;
    let mockSocketService: any;

    const mockAppointment = {
        id: 'apt-1',
        doctorId: 'doc-1',
        patientId: 'pat-1',
        appointmentDate: new Date(),
        status: AppointmentStatus.BOOKED
    };

    beforeEach(() => {
        mockAppointmentRepo = {
            findById: jest.fn(),
            updateStatus: jest.fn(),
            getTodaysQueue: jest.fn(),
        };
        mockQueueService = {
            removeFromQueue: jest.fn().mockResolvedValue(undefined),
        };
        mockSocketService = {
            emitQueueUpdated: jest.fn(),
            emitStatusChanged: jest.fn(),
        };
        useCase = new UpdateAppointmentStatusUseCase(
            mockAppointmentRepo,
            mockQueueService,
            mockSocketService
        );
        jest.clearAllMocks();
    });

    it('should successfully update status and emit events', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.updateStatus.mockResolvedValue({ ...mockAppointment, status: AppointmentStatus.COMPLETED });
        mockAppointmentRepo.getTodaysQueue.mockResolvedValue([]);

        const result = await useCase.execute({
            appointmentId: 'apt-1',
            status: AppointmentStatus.COMPLETED
        });

        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('apt-1', AppointmentStatus.COMPLETED);
        expect(mockQueueService.removeFromQueue).toHaveBeenCalled();
        expect(mockSocketService.emitStatusChanged).toHaveBeenCalledTimes(2);
        expect(result.status).toBe(AppointmentStatus.COMPLETED);
    });

    it('should not remove from queue if status is not final', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.updateStatus.mockResolvedValue({ ...mockAppointment, status: AppointmentStatus.BOOKED });

        await useCase.execute({
            appointmentId: 'apt-1',
            status: AppointmentStatus.BOOKED
        });

        expect(mockQueueService.removeFromQueue).not.toHaveBeenCalled();
        expect(mockSocketService.emitStatusChanged).toHaveBeenCalled();
    });

    it('should throw error if appointment not found', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute({ appointmentId: 'none', status: AppointmentStatus.COMPLETED }))
            .rejects.toThrow("Appointment not found");
    });
});
