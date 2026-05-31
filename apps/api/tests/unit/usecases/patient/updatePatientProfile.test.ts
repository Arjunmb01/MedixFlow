import { UpdatePatientProfileUseCase } from "@/application/use-cases/patient/updatePatientProfile.usecase";
import { MESSAGES } from "@/shared/constants";

describe('UpdatePatientProfileUseCase', () => {
    let useCase: UpdatePatientProfileUseCase;
    let mockPatientRepo: any;
    let mockCalculateCompletion: any;

    beforeEach(() => {
        mockPatientRepo = {
            findById: jest.fn(),
            updatePatient: jest.fn().mockResolvedValue(undefined),
        };
        mockCalculateCompletion = {
            execute: jest.fn().mockReturnValue(90),
        };
        useCase = new UpdatePatientProfileUseCase(mockPatientRepo, mockCalculateCompletion);
    });

    it('should successfully update and return profile', async () => {
        const mockPatient = { id: 'p-1', user: { email: 'a@b.com' } };
        mockPatientRepo.findById.mockResolvedValue(mockPatient);

        const result = await useCase.execute('p-1', { firstName: 'New' });

        expect(mockPatientRepo.updatePatient).toHaveBeenCalledWith('p-1', { firstName: 'New' });
        expect(result.profileCompletion).toBe(90);
    });

    it('should throw error if patient not found', async () => {
        mockPatientRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('p-1', { firstName: 'New' }))
            .rejects.toThrow(MESSAGES.PATIENT_NOT_FOUND);
    });

    it('should work with partial data updates (only updating provided fields)', async () => {
        const mockPatient = { id: 'p-1', firstName: 'Old', lastName: 'Name' };
        mockPatientRepo.findById.mockResolvedValue(mockPatient);
        
        await useCase.execute('p-1', { firstName: 'New' });
        
        expect(mockPatientRepo.updatePatient).toHaveBeenCalledWith('p-1', { firstName: 'New' });
    });

    it('should propagate repository errors for invalid updates', async () => {
        mockPatientRepo.findById.mockResolvedValue({ id: 'p-1' });
        mockPatientRepo.updatePatient.mockRejectedValue(new Error("Invalid field"));

        await expect(useCase.execute('p-1', { unknownField: 'val' } as any))
            .rejects.toThrow("Invalid field");
    });
});
