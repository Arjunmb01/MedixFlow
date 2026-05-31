import { GetDoctorProfileUseCase } from "@/application/use-cases/doctor/getDoctorProfile.usecase";

describe('GetDoctorProfileUseCase', () => {
    let useCase: GetDoctorProfileUseCase;
    let mockDoctorRepo: any;

    beforeEach(() => {
        mockDoctorRepo = {
            getProfile: jest.fn(),
        };
        useCase = new GetDoctorProfileUseCase(mockDoctorRepo);
    });

    it('should call repository getProfile', async () => {
        const mockProfile = { id: 'u-1' } as any;
        mockDoctorRepo.getProfile.mockResolvedValue(mockProfile);
        const result = await useCase.execute('u-1');
        expect(mockDoctorRepo.getProfile).toHaveBeenCalledWith('u-1');
        expect(result).toBe(mockProfile);
    });
});
