"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CancelLeaveUseCase_1 = require("@/application/use-cases/leave/CancelLeaveUseCase");
describe('CancelLeaveUseCase', () => {
    let useCase;
    let mockLeaveRepo;
    beforeEach(() => {
        mockLeaveRepo = {
            findById: jest.fn(),
            cancel: jest.fn(),
        };
        useCase = new CancelLeaveUseCase_1.CancelLeaveUseCase(mockLeaveRepo);
    });
    it('should successfully cancel leave', async () => {
        mockLeaveRepo.findById.mockResolvedValue({ id: 'l-1', doctorId: 'd-1' });
        mockLeaveRepo.cancel.mockResolvedValue({ id: 'l-1', status: 'CANCELLED' });
        const result = await useCase.execute('l-1', 'd-1');
        expect(mockLeaveRepo.cancel).toHaveBeenCalledWith('l-1', 'd-1');
        expect(result.status).toBe('CANCELLED');
    });
    it('should throw error if unauthorized', async () => {
        mockLeaveRepo.findById.mockResolvedValue({ id: 'l-1', doctorId: 'd-2' });
        await expect(useCase.execute('l-1', 'd-1')).rejects.toThrow("Unauthorized");
    });
});
