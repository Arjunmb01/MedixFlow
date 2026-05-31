"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const startConsultation_usecase_1 = require("@/application/use-cases/consultation/startConsultation.usecase");
describe('StartConsultationUseCase', () => {
    let useCase;
    let mockConsultationRepo;
    beforeEach(() => {
        mockConsultationRepo = {
            findById: jest.fn(),
            updateStatus: jest.fn(),
        };
        useCase = new startConsultation_usecase_1.StartConsultationUseCase(mockConsultationRepo);
        jest.clearAllMocks();
    });
    it('should successfully start consultation', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-1', status: 'WAITING' });
        mockConsultationRepo.updateStatus.mockResolvedValue({ id: 'c-1', status: 'IN_PROGRESS' });
        const result = await useCase.execute('c-1', 'd-1');
        expect(mockConsultationRepo.updateStatus).toHaveBeenCalledWith('c-1', 'IN_PROGRESS');
        expect(result.status).toBe('IN_PROGRESS');
    });
    it('should throw error if consultation not found', async () => {
        mockConsultationRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('none', 'd-1')).rejects.toThrow("Consultation record not found");
    });
    it('should throw error if unauthorized', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-2', status: 'WAITING' });
        await expect(useCase.execute('c-1', 'd-1')).rejects.toThrow("Unauthorized access");
    });
    it('should throw error if status is not WAITING', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-1', status: 'IN_PROGRESS' });
        await expect(useCase.execute('c-1', 'd-1')).rejects.toThrow("Cannot start consultation. Current status is IN_PROGRESS");
    });
});
