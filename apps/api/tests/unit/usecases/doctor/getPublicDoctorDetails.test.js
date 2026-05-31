"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getPublicDoctorDetails_usecase_1 = require("@/application/use-cases/doctor/getPublicDoctorDetails.usecase");
describe('GetPublicDoctorDetailsUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            findProfileById: jest.fn(),
        };
        useCase = new getPublicDoctorDetails_usecase_1.GetPublicDoctorDetailsUseCase(mockDoctorRepo);
    });
    it('should call repository findProfileById', async () => {
        const mockProfile = { id: 'd-1' };
        mockDoctorRepo.findProfileById.mockResolvedValue(mockProfile);
        const result = await useCase.execute('d-1');
        expect(mockDoctorRepo.findProfileById).toHaveBeenCalledWith('d-1');
        expect(result).toBe(mockProfile);
    });
});
