"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getDoctorProfile_usecase_1 = require("@/application/use-cases/doctor/getDoctorProfile.usecase");
describe('GetDoctorProfileUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            getProfile: jest.fn(),
        };
        useCase = new getDoctorProfile_usecase_1.GetDoctorProfileUseCase(mockDoctorRepo);
    });
    it('should call repository getProfile', async () => {
        const mockProfile = { id: 'u-1' };
        mockDoctorRepo.getProfile.mockResolvedValue(mockProfile);
        const result = await useCase.execute('u-1');
        expect(mockDoctorRepo.getProfile).toHaveBeenCalledWith('u-1');
        expect(result).toBe(mockProfile);
    });
});
