"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReviewLeaveUseCase_1 = require("@/application/use-cases/leave/ReviewLeaveUseCase");
const DoctorLeave_1 = require("@/domain/entities/DoctorLeave");
describe('ReviewLeaveUseCase', () => {
    let useCase;
    let mockLeaveRepo;
    beforeEach(() => {
        mockLeaveRepo = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        useCase = new ReviewLeaveUseCase_1.ReviewLeaveUseCase(mockLeaveRepo);
        jest.clearAllMocks();
    });
    it('should successfully approve leave', async () => {
        mockLeaveRepo.findById.mockResolvedValue({ id: 'l-1', status: DoctorLeave_1.LeaveStatus.PENDING });
        mockLeaveRepo.update.mockResolvedValue({ id: 'l-1', status: DoctorLeave_1.LeaveStatus.APPROVED });
        const result = await useCase.execute('l-1', { status: DoctorLeave_1.LeaveStatus.APPROVED });
        expect(mockLeaveRepo.update).toHaveBeenCalledWith('l-1', { status: DoctorLeave_1.LeaveStatus.APPROVED });
        expect(result.status).toBe(DoctorLeave_1.LeaveStatus.APPROVED);
    });
    it('should throw error if leave not pending', async () => {
        mockLeaveRepo.findById.mockResolvedValue({ id: 'l-1', status: DoctorLeave_1.LeaveStatus.APPROVED });
        await expect(useCase.execute('l-1', { status: DoctorLeave_1.LeaveStatus.REJECTED }))
            .rejects.toThrow("Only PENDING leave requests can be reviewed");
    });
});
