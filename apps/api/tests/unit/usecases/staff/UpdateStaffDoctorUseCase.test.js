"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateStaffDoctorUseCase_1 = require("@/application/use-cases/staff/UpdateStaffDoctorUseCase");
describe('UpdateStaffDoctorUseCase', () => {
    let useCase;
    let mockStaffRepo;
    beforeEach(() => {
        mockStaffRepo = {
            updateDoctor: jest.fn(),
        };
        useCase = new UpdateStaffDoctorUseCase_1.UpdateStaffDoctorUseCase(mockStaffRepo);
    });
    it('should call repository updateDoctor', async () => {
        const input = { id: 'd-1', data: { firstName: 'Updated' } };
        mockStaffRepo.updateDoctor.mockResolvedValue({ id: 'd-1', firstName: 'Updated' });
        const result = await useCase.execute(input);
        expect(mockStaffRepo.updateDoctor).toHaveBeenCalledWith('d-1', { firstName: 'Updated' });
        expect(result.firstName).toBe('Updated');
    });
});
