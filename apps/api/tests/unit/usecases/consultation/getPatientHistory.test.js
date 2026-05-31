"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getPatientHistory_usecase_1 = require("@/application/use-cases/consultation/getPatientHistory.usecase");
describe('GetPatientHistoryUseCase', () => {
    let useCase;
    let mockConsultationRepo;
    beforeEach(() => {
        mockConsultationRepo = {
            getPatientHistory: jest.fn(),
        };
        useCase = new getPatientHistory_usecase_1.GetPatientHistoryUseCase(mockConsultationRepo);
    });
    it('should call repository getPatientHistory with patientId', async () => {
        const mockHistory = [{ id: '1' }];
        mockConsultationRepo.getPatientHistory.mockResolvedValue(mockHistory);
        const result = await useCase.execute('p-1');
        expect(mockConsultationRepo.getPatientHistory).toHaveBeenCalledWith('p-1');
        expect(result).toBe(mockHistory);
    });
});
