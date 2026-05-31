import { GetAllLeavesUseCase } from "@/application/use-cases/leave/GetAllLeavesUseCase";

describe('GetAllLeavesUseCase', () => {
    let useCase: GetAllLeavesUseCase;
    let mockLeaveRepo: any;

    beforeEach(() => {
        mockLeaveRepo = {
            findAll: jest.fn(),
        };
        useCase = new GetAllLeavesUseCase(mockLeaveRepo);
    });

    it('should call repository findAll with filters', async () => {
        const filters = { status: 'PENDING' };
        mockLeaveRepo.findAll.mockResolvedValue({ leaves: [], total: 0 });
        await useCase.execute(filters);
        expect(mockLeaveRepo.findAll).toHaveBeenCalledWith(filters);
    });
});
