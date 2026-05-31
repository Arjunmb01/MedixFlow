import { GetConsultedPatientsUseCase } from "@/application/use-cases/doctor/getConsultedPatients.usecase";

describe('GetConsultedPatientsUseCase', () => {
    let useCase: GetConsultedPatientsUseCase;
    let mockDoctorRepo: any;

    beforeEach(() => {
        mockDoctorRepo = {
            getConsultedPatients: jest.fn(),
        };
        useCase = new GetConsultedPatientsUseCase(mockDoctorRepo);
    });

    it('should call repository getConsultedPatients', async () => {
        const mockPatients = [{ id: 'p-1' }] as any;
        mockDoctorRepo.getConsultedPatients.mockResolvedValue(mockPatients);
        const result = await useCase.execute('d-1');
        expect(mockDoctorRepo.getConsultedPatients).toHaveBeenCalledWith('d-1');
        expect(result).toBe(mockPatients);
    });
});
