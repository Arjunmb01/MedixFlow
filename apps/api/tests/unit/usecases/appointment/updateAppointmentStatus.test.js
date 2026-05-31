"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updateAppointmentStatus_usecase_1 = require("@/application/use-cases/appointment/updateAppointmentStatus.usecase");
const AppointmentStatus_1 = require("@/domain/value-objects/enums/AppointmentStatus");
describe('UpdateAppointmentStatusUseCase', () => {
    let useCase;
    let mockAppointmentRepo;
    let mockQueueService;
    let mockSocketService;
    const mockAppointment = {
        id: 'apt-1',
        doctorId: 'doc-1',
        patientId: 'pat-1',
        appointmentDate: new Date(),
        status: AppointmentStatus_1.AppointmentStatus.BOOKED
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
        useCase = new updateAppointmentStatus_usecase_1.UpdateAppointmentStatusUseCase(mockAppointmentRepo, mockQueueService, mockSocketService);
        jest.clearAllMocks();
    });
    it('should successfully update status and emit events', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.updateStatus.mockResolvedValue({ ...mockAppointment, status: AppointmentStatus_1.AppointmentStatus.COMPLETED });
        mockAppointmentRepo.getTodaysQueue.mockResolvedValue([]);
        const result = await useCase.execute({
            appointmentId: 'apt-1',
            status: AppointmentStatus_1.AppointmentStatus.COMPLETED
        });
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('apt-1', AppointmentStatus_1.AppointmentStatus.COMPLETED);
        expect(mockQueueService.removeFromQueue).toHaveBeenCalled();
        expect(mockSocketService.emitStatusChanged).toHaveBeenCalledTimes(2);
        expect(result.status).toBe(AppointmentStatus_1.AppointmentStatus.COMPLETED);
    });
    it('should not remove from queue if status is not final', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.updateStatus.mockResolvedValue({ ...mockAppointment, status: AppointmentStatus_1.AppointmentStatus.BOOKED });
        await useCase.execute({
            appointmentId: 'apt-1',
            status: AppointmentStatus_1.AppointmentStatus.BOOKED
        });
        expect(mockQueueService.removeFromQueue).not.toHaveBeenCalled();
        expect(mockSocketService.emitStatusChanged).toHaveBeenCalled();
    });
    it('should throw error if appointment not found', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute({ appointmentId: 'none', status: AppointmentStatus_1.AppointmentStatus.COMPLETED }))
            .rejects.toThrow("Appointment not found");
    });
});
