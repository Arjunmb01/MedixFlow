"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkRescheduleConflict_usecase_1 = require("@/application/use-cases/appointment/checkRescheduleConflict.usecase");
describe('CheckRescheduleConflictUseCase', () => {
    let useCase;
    let mockAppointmentRepo;
    let mockDateTimeService;
    const mockInput = {
        appointmentId: 'apt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        newDate: new Date(Date.now() + 86400000), // tomorrow
        slotStart: '10:00',
        slotEnd: '10:30'
    };
    beforeEach(() => {
        mockAppointmentRepo = {
            checkConflict: jest.fn(),
        };
        mockDateTimeService = {
            now: jest.fn().mockReturnValue(new Date()),
        };
        useCase = new checkRescheduleConflict_usecase_1.CheckRescheduleConflictUseCase(mockAppointmentRepo, mockDateTimeService);
        jest.clearAllMocks();
    });
    it('should return conflict if date is in the past', async () => {
        const pastDate = new Date(Date.now() - 86400000);
        const result = await useCase.execute({ ...mockInput, newDate: pastDate });
        expect(result).toEqual({
            hasConflict: true,
            type: 'PAST_TIME',
            message: "Cannot reschedule to a past date/time."
        });
        expect(mockAppointmentRepo.checkConflict).not.toHaveBeenCalled();
    });
    it('should call repository checkConflict if date is valid', async () => {
        const mockRepoResult = { hasConflict: false, message: "" };
        mockAppointmentRepo.checkConflict.mockResolvedValue(mockRepoResult);
        const result = await useCase.execute(mockInput);
        expect(mockAppointmentRepo.checkConflict).toHaveBeenCalledWith(expect.objectContaining({
            patientId: 'patient-1',
            doctorId: 'doctor-1',
            excludeAppointmentId: 'apt-1'
        }));
        expect(result).toBe(mockRepoResult);
    });
    it('should pass correct startTime and endTime to repository', async () => {
        mockAppointmentRepo.checkConflict.mockResolvedValue({ hasConflict: false });
        const testDate = new Date(Date.now() + 2 * 86400000); // 2 days in future
        await useCase.execute({ ...mockInput, newDate: testDate, slotStart: '14:30', slotEnd: '15:00' });
        const callArgs = mockAppointmentRepo.checkConflict.mock.calls[0][0];
        expect(callArgs.startTime.getHours()).toBe(14);
        expect(callArgs.startTime.getMinutes()).toBe(30);
        expect(callArgs.endTime.getHours()).toBe(15);
        expect(callArgs.endTime.getMinutes()).toBe(0);
    });
});
