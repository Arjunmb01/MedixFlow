"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getLabTests_usecase_1 = require("@/application/use-cases/consultation/getLabTests.usecase");
describe('GetLabTestsUseCase', () => {
    let useCase;
    let mockConsultationRepo;
    beforeEach(() => {
        mockConsultationRepo = {
            getLabTestsByConsultation: jest.fn(),
        };
        useCase = new getLabTests_usecase_1.GetLabTestsUseCase(mockConsultationRepo);
    });
    it('should call repository getLabTestsByConsultation with consultationId', async () => {
        const mockTests = [{ id: '1' }];
        mockConsultationRepo.getLabTestsByConsultation.mockResolvedValue(mockTests);
        const result = await useCase.execute('c-1');
        expect(mockConsultationRepo.getLabTestsByConsultation).toHaveBeenCalledWith('c-1');
        expect(result).toBe(mockTests);
    });
});
