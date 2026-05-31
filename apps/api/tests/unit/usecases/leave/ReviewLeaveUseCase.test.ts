import { ReviewLeaveUseCase } from "@/application/use-cases/leave/ReviewLeaveUseCase";
import { LeaveStatus } from "@/domain/entities/DoctorLeave";

describe('ReviewLeaveUseCase', () => {
    let useCase: ReviewLeaveUseCase;
    let mockLeaveRepo: any;

    beforeEach(() => {
        mockLeaveRepo = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        useCase = new ReviewLeaveUseCase(mockLeaveRepo);
        jest.clearAllMocks();
    });

    it('should successfully approve leave', async () => {
        mockLeaveRepo.findById.mockResolvedValue({ id: 'l-1', status: LeaveStatus.PENDING });
        mockLeaveRepo.update.mockResolvedValue({ id: 'l-1', status: LeaveStatus.APPROVED });

        const result = await useCase.execute('l-1', { status: LeaveStatus.APPROVED });

        expect(mockLeaveRepo.update).toHaveBeenCalledWith('l-1', { status: LeaveStatus.APPROVED });
        expect(result.status).toBe(LeaveStatus.APPROVED);
    });

    it('should throw error if leave not pending', async () => {
        mockLeaveRepo.findById.mockResolvedValue({ id: 'l-1', status: LeaveStatus.APPROVED });
        await expect(useCase.execute('l-1', { status: LeaveStatus.REJECTED }))
            .rejects.toThrow("Only PENDING leave requests can be reviewed");
    });
});
