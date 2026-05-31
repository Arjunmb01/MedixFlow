"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getDoctorAppointments_usecase_1 = require("@/application/use-cases/appointment/getDoctorAppointments.usecase");
describe('GetDoctorAppointmentsUseCase', () => {
    let useCase;
    let mockAppointmentRepo;
    let mockDateTimeService;
    beforeEach(() => {
        mockAppointmentRepo = {
            markPastAppointmentsAsNotAttended: jest.fn().mockResolvedValue(undefined),
            getAppointmentsByDoctorId: jest.fn(),
        };
        mockDateTimeService = {
            isUpcoming: jest.fn(),
        };
        useCase = new getDoctorAppointments_usecase_1.GetDoctorAppointmentsUseCase(mockAppointmentRepo, mockDateTimeService);
        jest.clearAllMocks();
    });
    it('should throw error if doctorId is missing', async () => {
        await expect(useCase.execute('')).rejects.toThrow("Doctor ID is required");
    });
    it('should mark past appointments and return results', async () => {
        // Arrange
        const doctorId = 'doc-1';
        const mockResult = {
            data: [{ id: '1', appointmentDate: new Date(), slotStart: '10:00' }],
            meta: { total: 1, page: 1, limit: 10 }
        };
        mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue(mockResult);
        // Act
        const result = await useCase.execute(doctorId, { isUpcoming: true });
        // Assert
        expect(mockAppointmentRepo.markPastAppointmentsAsNotAttended).toHaveBeenCalled();
        expect(mockAppointmentRepo.getAppointmentsByDoctorId).toHaveBeenCalledWith(doctorId, { isUpcoming: true });
        expect(result.data).toEqual(mockResult.data);
    });
    it('should filter out upcoming appointments if isUpcoming filter is undefined', async () => {
        // Arrange
        const mockAppointments = [
            { id: '1', appointmentDate: new Date(), slotStart: '09:00' }, // Past
            { id: '2', appointmentDate: new Date(), slotStart: '14:00' } // Upcoming
        ];
        mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue({
            data: mockAppointments,
            meta: { total: 2, page: 1, limit: 10 }
        });
        mockDateTimeService.isUpcoming.mockImplementation((date, slot) => slot === '14:00');
        // Act
        const result = await useCase.execute('doc-1', {});
        // Assert
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe('1');
        expect(result.meta.total).toBe(1);
    });
});
