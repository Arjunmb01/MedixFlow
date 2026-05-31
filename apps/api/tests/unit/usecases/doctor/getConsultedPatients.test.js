"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getConsultedPatients_usecase_1 = require("@/application/use-cases/doctor/getConsultedPatients.usecase");
describe('GetConsultedPatientsUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            getConsultedPatients: jest.fn(),
        };
        useCase = new getConsultedPatients_usecase_1.GetConsultedPatientsUseCase(mockDoctorRepo);
    });
    it('should call repository getConsultedPatients', async () => {
        const mockPatients = [{ id: 'p-1' }];
        mockDoctorRepo.getConsultedPatients.mockResolvedValue(mockPatients);
        const result = await useCase.execute('d-1');
        expect(mockDoctorRepo.getConsultedPatients).toHaveBeenCalledWith('d-1');
        expect(result).toBe(mockPatients);
    });
});
