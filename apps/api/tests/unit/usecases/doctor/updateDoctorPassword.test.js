"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updateDoctorPassword_usecase_1 = require("@/application/use-cases/doctor/updateDoctorPassword.usecase");
const constants_1 = require("@/shared/constants");
describe('UpdateDoctorPasswordUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    let mockPasswordHasher;
    beforeEach(() => {
        mockDoctorRepo = {
            findById: jest.fn(),
            updatePassword: jest.fn().mockResolvedValue(undefined),
        };
        mockPasswordHasher = {
            compare: jest.fn(),
            hash: jest.fn().mockResolvedValue('new-hash'),
        };
        useCase = new updateDoctorPassword_usecase_1.UpdateDoctorPasswordUseCase(mockDoctorRepo, mockPasswordHasher);
        jest.clearAllMocks();
    });
    it('should successfully update password', async () => {
        mockDoctorRepo.findById.mockResolvedValue({ id: 'u-1', passwordHash: 'old-hash' });
        mockPasswordHasher.compare.mockResolvedValue(true);
        await useCase.execute('u-1', { currentPassword: 'old', newPassword: 'new-password' });
        expect(mockPasswordHasher.hash).toHaveBeenCalledWith('new-password');
        expect(mockDoctorRepo.updatePassword).toHaveBeenCalledWith('u-1', 'new-hash');
    });
    it('should throw error if new password is too short', async () => {
        await expect(useCase.execute('u-1', { currentPassword: 'old', newPassword: 'short' }))
            .rejects.toThrow(constants_1.MESSAGES.NEW_PASSWORD_LENGTH);
    });
    it('should throw error if current password is incorrect', async () => {
        mockDoctorRepo.findById.mockResolvedValue({ id: 'u-1', passwordHash: 'old-hash' });
        mockPasswordHasher.compare.mockResolvedValue(false);
        await expect(useCase.execute('u-1', { currentPassword: 'wrong', newPassword: 'new-password' }))
            .rejects.toThrow(constants_1.MESSAGES.CURRENT_PASSWORD_INCORRECT);
    });
});
