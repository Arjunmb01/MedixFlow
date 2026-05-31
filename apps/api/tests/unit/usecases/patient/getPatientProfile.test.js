"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getPatientProfile_usecase_1 = require("@/application/use-cases/patient/getPatientProfile.usecase");
const constants_1 = require("@/shared/constants");
describe('GetPatientProfileUseCase', () => {
    let useCase;
    let mockPatientRepo;
    let mockCalculateCompletion;
    beforeEach(() => {
        mockPatientRepo = {
            findById: jest.fn(),
        };
        mockCalculateCompletion = {
            execute: jest.fn().mockReturnValue(80),
        };
        useCase = new getPatientProfile_usecase_1.GetPatientProfileUseCase(mockPatientRepo, mockCalculateCompletion);
    });
    it('should return patient profile with completion percentage', async () => {
        const mockPatient = {
            id: 'p-1',
            email: 'test@test.com',
            firstName: 'John',
            lastName: 'Doe',
            user: { email: 'test@test.com', phone: '123' }
        };
        mockPatientRepo.findById.mockResolvedValue(mockPatient);
        const result = await useCase.execute('p-1');
        expect(result.profileCompletion).toBe(80);
        expect(result.email).toBe('test@test.com');
    });
    it('should throw error if patient not found', async () => {
        mockPatientRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('none')).rejects.toThrow(constants_1.MESSAGES.PATIENT_NOT_FOUND);
    });
});
