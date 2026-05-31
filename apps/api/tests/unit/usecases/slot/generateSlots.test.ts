import { GenerateSlotsUseCase } from "@/application/use-cases/slot/generateSlots.usecase";

describe('GenerateSlotsUseCase', () => {
    let useCase: GenerateSlotsUseCase;
    let mockSlotRepo: any;
    let mockDoctorRepo: any;
    let mockSchedulingPolicy: any;

    beforeEach(() => {
        mockSlotRepo = {
            findByDoctorAndDate: jest.fn().mockResolvedValue([]),
            createMany: jest.fn().mockResolvedValue(undefined),
        };
        mockDoctorRepo = {
            getSchedulesByDay: jest.fn(),
        };
        mockSchedulingPolicy = {
            calculateSlotCapacity: jest.fn().mockReturnValue(1),
        };
        useCase = new GenerateSlotsUseCase(mockSlotRepo, mockDoctorRepo, mockSchedulingPolicy);
        jest.clearAllMocks();
    });

    it('should generate slots based on doctor schedule', async () => {
        // Arrange
        const date = new Date('2026-05-10'); // Assume Sunday (0)
        mockDoctorRepo.getSchedulesByDay.mockResolvedValue([
            { startTime: '09:00', endTime: '10:00', slotDurationMinutes: 30, consultationType: 'GENERAL' }
        ]);

        // Act
        await useCase.execute({ doctorId: 'd-1', date });

        // Assert
        expect(mockSlotRepo.createMany).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ doctorId: 'd-1' })
        ]));
        // Should have 2 slots for 1 hour with 30 min duration
        const createdSlots = mockSlotRepo.createMany.mock.calls[0][0];
        expect(createdSlots.length).toBe(2);
    });

    it('should skip if slots already exist', async () => {
        mockSlotRepo.findByDoctorAndDate.mockResolvedValue([{ id: 's-1' }]);
        await useCase.execute({ doctorId: 'd-1', date: new Date() });
        expect(mockSlotRepo.createMany).not.toHaveBeenCalled();
    });

    it('should throw error if no schedules found', async () => {
        mockDoctorRepo.getSchedulesByDay.mockResolvedValue([]);
        await expect(useCase.execute({ doctorId: 'd-1', date: new Date('2026-05-10') }))
            .rejects.toThrow("No schedules found");
    });
});
