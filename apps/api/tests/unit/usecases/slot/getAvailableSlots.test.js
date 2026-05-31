"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAvailableSlots_usecase_1 = require("@/application/use-cases/slot/getAvailableSlots.usecase");
describe('GetAvailableSlotCase', () => {
    let useCase;
    let mockDoctorRepo;
    let mockAppointmentRepo;
    let mockLeaveRepo;
    let mockSlotGenerator;
    beforeEach(() => {
        mockDoctorRepo = {
            getSchedulesByDay: jest.fn(),
            getBreaksByDay: jest.fn().mockResolvedValue([]),
        };
        mockAppointmentRepo = {
            getAppointmentsForSlotGeneration: jest.fn().mockResolvedValue([]),
        };
        mockLeaveRepo = {
            findByDoctor: jest.fn().mockResolvedValue([]),
        };
        mockSlotGenerator = {
            generate: jest.fn().mockReturnValue([]),
        };
        useCase = new getAvailableSlots_usecase_1.GetAvailableSlotCase(mockDoctorRepo, mockAppointmentRepo, mockLeaveRepo, mockSlotGenerator);
        jest.clearAllMocks();
    });
    it('should successfully call SlotGenerator with mapped data', async () => {
        const date = new Date('2026-05-10');
        mockDoctorRepo.getSchedulesByDay.mockResolvedValue([
            { startTime: '09:00', endTime: '12:00', slotDurationMinutes: 30 }
        ]);
        await useCase.execute({ doctorId: 'd-1', date });
        expect(mockSlotGenerator.generate).toHaveBeenCalled();
        const workingDay = mockSlotGenerator.generate.mock.calls[0][1];
        expect(workingDay.shifts.length).toBe(1);
    });
    it('should return empty array if no schedules found', async () => {
        mockDoctorRepo.getSchedulesByDay.mockResolvedValue([]);
        const result = await useCase.execute({ doctorId: 'd-1', date: new Date() });
        expect(result).toEqual([]);
        expect(mockSlotGenerator.generate).not.toHaveBeenCalled();
    });
});
