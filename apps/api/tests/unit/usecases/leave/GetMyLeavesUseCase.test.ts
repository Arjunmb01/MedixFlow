import { GetMyLeavesUseCase } from "@/application/use-cases/leave/GetMyLeavesUseCase";

describe('GetMyLeavesUseCase', () => {
    let useCase: GetMyLeavesUseCase;
    let mockLeaveRepo: any;

    beforeEach(() => {
        mockLeaveRepo = {
            findByDoctor: jest.fn(),
        };
        useCase = new GetMyLeavesUseCase(mockLeaveRepo);
    });

    it('should call repository findByDoctor', async () => {
        mockLeaveRepo.findByDoctor.mockResolvedValue([]);
        await useCase.execute('d-1');
        expect(mockLeaveRepo.findByDoctor).toHaveBeenCalledWith('d-1');
    });
});
