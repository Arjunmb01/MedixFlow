"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetAllLeavesUseCase_1 = require("@/application/use-cases/leave/GetAllLeavesUseCase");
describe('GetAllLeavesUseCase', () => {
    let useCase;
    let mockLeaveRepo;
    beforeEach(() => {
        mockLeaveRepo = {
            findAll: jest.fn(),
        };
        useCase = new GetAllLeavesUseCase_1.GetAllLeavesUseCase(mockLeaveRepo);
    });
    it('should call repository findAll with filters', async () => {
        const filters = { status: 'PENDING' };
        mockLeaveRepo.findAll.mockResolvedValue({ leaves: [], total: 0 });
        await useCase.execute(filters);
        expect(mockLeaveRepo.findAll).toHaveBeenCalledWith(filters);
    });
});
