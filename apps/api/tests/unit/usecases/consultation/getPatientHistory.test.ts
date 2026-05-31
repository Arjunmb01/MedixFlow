import { GetPatientHistoryUseCase } from "@/application/use-cases/consultation/getPatientHistory.usecase";

describe('GetPatientHistoryUseCase', () => {
    let useCase: GetPatientHistoryUseCase;
    let mockConsultationRepo: any;

    beforeEach(() => {
        mockConsultationRepo = {
            getPatientHistory: jest.fn(),
        };
        useCase = new GetPatientHistoryUseCase(mockConsultationRepo);
    });

    it('should call repository getPatientHistory with patientId', async () => {
        const mockHistory = [{ id: '1' }];
        mockConsultationRepo.getPatientHistory.mockResolvedValue(mockHistory);

        const result = await useCase.execute('p-1');

        expect(mockConsultationRepo.getPatientHistory).toHaveBeenCalledWith('p-1');
        expect(result).toBe(mockHistory);
    });
});
