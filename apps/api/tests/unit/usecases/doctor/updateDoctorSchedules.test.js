"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updateDoctorSchedules_usecase_1 = require("@/application/use-cases/doctor/updateDoctorSchedules.usecase");
describe('UpdateDoctorSchedulesUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            updateSchedules: jest.fn(),
        };
        useCase = new updateDoctorSchedules_usecase_1.UpdateDoctorSchedulesUseCase(mockDoctorRepo);
    });
    it('should call repository updateSchedules', async () => {
        const schedules = [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }];
        await useCase.execute('u-1', schedules);
        expect(mockDoctorRepo.updateSchedules).toHaveBeenCalledWith('u-1', schedules);
    });
    it('should throw error if startTime is after endTime', async () => {
        const schedules = [{ dayOfWeek: 1, startTime: '17:00', endTime: '09:00' }];
        await expect(useCase.execute('u-1', schedules))
            .rejects.toThrow("Start time must be before end time");
    });
    it('should throw error for invalid time format', async () => {
        const schedules = [{ dayOfWeek: 1, startTime: '09:00', endTime: 'invalid' }];
        await expect(useCase.execute('u-1', schedules))
            .rejects.toThrow("Use HH:mm");
    });
});
