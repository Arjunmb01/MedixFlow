import { UpdateStaffDoctorUseCase } from "@/application/use-cases/staff/UpdateStaffDoctorUseCase";

describe('UpdateStaffDoctorUseCase', () => {
    let useCase: UpdateStaffDoctorUseCase;
    let mockStaffRepo: any;

    beforeEach(() => {
        mockStaffRepo = {
            updateDoctor: jest.fn(),
        };
        useCase = new UpdateStaffDoctorUseCase(mockStaffRepo);
    });

    it('should call repository updateDoctor', async () => {
        const input = { id: 'd-1', data: { firstName: 'Updated' } } as any;
        mockStaffRepo.updateDoctor.mockResolvedValue({ id: 'd-1', firstName: 'Updated' });
        
        const result = await useCase.execute(input);

        expect(mockStaffRepo.updateDoctor).toHaveBeenCalledWith('d-1', { firstName: 'Updated' });
        expect(result.firstName).toBe('Updated');
    });
});
