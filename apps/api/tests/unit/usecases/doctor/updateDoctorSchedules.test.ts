import { UpdateDoctorSchedulesUseCase } from "@/application/use-cases/doctor/updateDoctorSchedules.usecase";

describe('UpdateDoctorSchedulesUseCase', () => {
    let useCase: UpdateDoctorSchedulesUseCase;
    let mockDoctorRepo: any;

    beforeEach(() => {
        mockDoctorRepo = {
            updateSchedules: jest.fn(),
        };
        useCase = new UpdateDoctorSchedulesUseCase(mockDoctorRepo);
    });

    it('should call repository updateSchedules', async () => {
        const schedules = [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }] as any;
        await useCase.execute('u-1', schedules);
        expect(mockDoctorRepo.updateSchedules).toHaveBeenCalledWith('u-1', schedules);
    });

    it('should throw error if startTime is after endTime', async () => {
        const schedules = [{ dayOfWeek: 1, startTime: '17:00', endTime: '09:00' }] as any;
        await expect(useCase.execute('u-1', schedules))
            .rejects.toThrow("Start time must be before end time");
    });

    it('should throw error for invalid time format', async () => {
        const schedules = [{ dayOfWeek: 1, startTime: '09:00', endTime: 'invalid' }] as any;
        await expect(useCase.execute('u-1', schedules))
            .rejects.toThrow("Use HH:mm");
    });
});
