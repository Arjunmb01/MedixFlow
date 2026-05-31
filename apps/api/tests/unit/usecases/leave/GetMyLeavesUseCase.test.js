"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetMyLeavesUseCase_1 = require("@/application/use-cases/leave/GetMyLeavesUseCase");
describe('GetMyLeavesUseCase', () => {
    let useCase;
    let mockLeaveRepo;
    beforeEach(() => {
        mockLeaveRepo = {
            findByDoctor: jest.fn(),
        };
        useCase = new GetMyLeavesUseCase_1.GetMyLeavesUseCase(mockLeaveRepo);
    });
    it('should call repository findByDoctor', async () => {
        mockLeaveRepo.findByDoctor.mockResolvedValue([]);
        await useCase.execute('d-1');
        expect(mockLeaveRepo.findByDoctor).toHaveBeenCalledWith('d-1');
    });
});
