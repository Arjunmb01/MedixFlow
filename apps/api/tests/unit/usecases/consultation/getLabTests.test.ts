import { GetLabTestsUseCase } from "@/application/use-cases/consultation/getLabTests.usecase";

describe('GetLabTestsUseCase', () => {
    let useCase: GetLabTestsUseCase;
    let mockConsultationRepo: any;

    beforeEach(() => {
        mockConsultationRepo = {
            getLabTestsByConsultation: jest.fn(),
        };
        useCase = new GetLabTestsUseCase(mockConsultationRepo);
    });

    it('should call repository getLabTestsByConsultation with consultationId', async () => {
        const mockTests = [{ id: '1' }];
        mockConsultationRepo.getLabTestsByConsultation.mockResolvedValue(mockTests);

        const result = await useCase.execute('c-1');

        expect(mockConsultationRepo.getLabTestsByConsultation).toHaveBeenCalledWith('c-1');
        expect(result).toBe(mockTests);
    });
});
