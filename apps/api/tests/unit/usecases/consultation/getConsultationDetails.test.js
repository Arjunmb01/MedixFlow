"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getConsultationDetails_usecase_1 = require("@/application/use-cases/consultation/getConsultationDetails.usecase");
describe('GetConsultationDetailsUseCase', () => {
    let useCase;
    let mockConsultationRepo;
    beforeEach(() => {
        mockConsultationRepo = {
            findById: jest.fn(),
        };
        useCase = new getConsultationDetails_usecase_1.GetConsultationDetailsUseCase(mockConsultationRepo);
    });
    it('should return consultation if doctor matches', async () => {
        const mockConsultation = { id: 'c-1', doctorId: 'd-1' };
        mockConsultationRepo.findById.mockResolvedValue(mockConsultation);
        const result = await useCase.execute({ id: 'c-1', doctorId: 'd-1' });
        expect(result).toBe(mockConsultation);
    });
    it('should throw error if unauthorized doctor', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-2' });
        await expect(useCase.execute({ id: 'c-1', doctorId: 'd-1' }))
            .rejects.toThrow("Unauthorized access");
    });
});
