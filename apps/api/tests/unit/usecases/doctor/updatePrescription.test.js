"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updatePrescription_usecase_1 = require("@/application/use-cases/doctor/updatePrescription.usecase");
describe('UpdatePrescriptionUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            updatePrescription: jest.fn(),
        };
        useCase = new updatePrescription_usecase_1.UpdatePrescriptionUseCase(mockDoctorRepo);
    });
    it('should call repository updatePrescription', async () => {
        const input = { id: 'p-1', instructions: 'Take twice a day', medicines: [] };
        mockDoctorRepo.updatePrescription.mockResolvedValue({ ...input });
        const result = await useCase.execute(input);
        expect(mockDoctorRepo.updatePrescription).toHaveBeenCalledWith('p-1', { instructions: 'Take twice a day', medicines: [] });
        expect(result.id).toBe('p-1');
    });
});
