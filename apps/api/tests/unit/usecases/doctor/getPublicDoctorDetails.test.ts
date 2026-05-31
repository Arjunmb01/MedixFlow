import { GetPublicDoctorDetailsUseCase } from "@/application/use-cases/doctor/getPublicDoctorDetails.usecase";

describe('GetPublicDoctorDetailsUseCase', () => {
    let useCase: GetPublicDoctorDetailsUseCase;
    let mockDoctorRepo: any;

    beforeEach(() => {
        mockDoctorRepo = {
            findProfileById: jest.fn(),
        };
        useCase = new GetPublicDoctorDetailsUseCase(mockDoctorRepo);
    });

    it('should call repository findProfileById', async () => {
        const mockProfile = { id: 'd-1' } as any;
        mockDoctorRepo.findProfileById.mockResolvedValue(mockProfile);
        const result = await useCase.execute('d-1');
        expect(mockDoctorRepo.findProfileById).toHaveBeenCalledWith('d-1');
        expect(result).toBe(mockProfile);
    });
});
