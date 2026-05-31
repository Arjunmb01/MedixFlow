"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkinPatient_usecase_1 = require("@/application/use-cases/consultation/checkinPatient.usecase");
describe('CheckinPatientUseCase', () => {
    let useCase;
    let mockAppointmentRepo;
    let mockConsultationRepo;
    let mockDateTimeService;
    beforeEach(() => {
        mockAppointmentRepo = {
            findById: jest.fn(),
            updateStatus: jest.fn(),
        };
        mockConsultationRepo = {
            findByAppointmentId: jest.fn(),
            create: jest.fn(),
        };
        mockDateTimeService = {
            isWithinCheckInWindow: jest.fn(),
        };
        useCase = new checkinPatient_usecase_1.CheckinPatientUseCase(mockAppointmentRepo, mockConsultationRepo, mockDateTimeService);
        jest.clearAllMocks();
    });
    it('should successfully check in patient', async () => {
        // Arrange
        const appointment = { id: 'a-1', patientId: 'p-1', doctorId: 'd-1', appointmentDate: new Date(), slotStart: '10:00' };
        mockAppointmentRepo.findById.mockResolvedValue(appointment);
        mockDateTimeService.isWithinCheckInWindow.mockReturnValue(true);
        mockConsultationRepo.findByAppointmentId.mockResolvedValue(null);
        mockConsultationRepo.create.mockResolvedValue({ id: 'c-1' });
        // Act
        const result = await useCase.execute('a-1', 'p-1');
        // Assert
        expect(mockConsultationRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            appointmentId: 'a-1',
            doctorId: 'd-1'
        }));
        expect(result.id).toBe('c-1');
    });
    it('should throw error if not within check-in window', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', patientId: 'p-1' });
        mockDateTimeService.isWithinCheckInWindow.mockReturnValue(false);
        await expect(useCase.execute('a-1', 'p-1'))
            .rejects.toThrow("Check-in is only allowed within 15 minutes");
    });
    it('should throw error if already checked in', async () => {
        mockAppointmentRepo.findById.mockResolvedValue({ id: 'a-1', patientId: 'p-1' });
        mockDateTimeService.isWithinCheckInWindow.mockReturnValue(true);
        mockConsultationRepo.findByAppointmentId.mockResolvedValue({ id: 'c-1' });
        await expect(useCase.execute('a-1', 'p-1'))
            .rejects.toThrow("Already Checked in");
    });
});
