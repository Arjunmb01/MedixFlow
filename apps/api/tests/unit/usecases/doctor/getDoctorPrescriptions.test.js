"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getDoctorPrescriptions_usecase_1 = require("@/application/use-cases/doctor/getDoctorPrescriptions.usecase");
describe('GetDoctorPrescriptionsUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            getDoctorPrescriptions: jest.fn(),
        };
        useCase = new getDoctorPrescriptions_usecase_1.GetDoctorPrescriptionsUseCase(mockDoctorRepo);
    });
    it('should call repository getDoctorPrescriptions', async () => {
        const mockPrescriptions = [{ id: 'p-1' }];
        mockDoctorRepo.getDoctorPrescriptions.mockResolvedValue(mockPrescriptions);
        const result = await useCase.execute('d-1');
        expect(mockDoctorRepo.getDoctorPrescriptions).toHaveBeenCalledWith('d-1');
        expect(result).toBe(mockPrescriptions);
    });
});
