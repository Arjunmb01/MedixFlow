import { GetDoctorPrescriptionsUseCase } from "@/application/use-cases/doctor/getDoctorPrescriptions.usecase";

describe('GetDoctorPrescriptionsUseCase', () => {
    let useCase: GetDoctorPrescriptionsUseCase;
    let mockDoctorRepo: any;

    beforeEach(() => {
        mockDoctorRepo = {
            getDoctorPrescriptions: jest.fn(),
        };
        useCase = new GetDoctorPrescriptionsUseCase(mockDoctorRepo);
    });

    it('should call repository getDoctorPrescriptions', async () => {
        const mockPrescriptions = [{ id: 'p-1' }] as any;
        mockDoctorRepo.getDoctorPrescriptions.mockResolvedValue(mockPrescriptions);
        const result = await useCase.execute('d-1');
        expect(mockDoctorRepo.getDoctorPrescriptions).toHaveBeenCalledWith('d-1');
        expect(result).toBe(mockPrescriptions);
    });
});
