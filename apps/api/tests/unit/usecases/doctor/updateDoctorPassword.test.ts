import { UpdateDoctorPasswordUseCase } from "@/application/use-cases/doctor/updateDoctorPassword.usecase";
import { MESSAGES } from "@/shared/constants";

describe('UpdateDoctorPasswordUseCase', () => {
    let useCase: UpdateDoctorPasswordUseCase;
    let mockDoctorRepo: any;
    let mockPasswordHasher: any;

    beforeEach(() => {
        mockDoctorRepo = {
            findById: jest.fn(),
            updatePassword: jest.fn().mockResolvedValue(undefined),
        };
        mockPasswordHasher = {
            compare: jest.fn(),
            hash: jest.fn().mockResolvedValue('new-hash'),
        };
        useCase = new UpdateDoctorPasswordUseCase(mockDoctorRepo, mockPasswordHasher);
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
            .rejects.toThrow(MESSAGES.NEW_PASSWORD_LENGTH);
    });

    it('should throw error if current password is incorrect', async () => {
        mockDoctorRepo.findById.mockResolvedValue({ id: 'u-1', passwordHash: 'old-hash' });
        mockPasswordHasher.compare.mockResolvedValue(false);

        await expect(useCase.execute('u-1', { currentPassword: 'wrong', newPassword: 'new-password' }))
            .rejects.toThrow(MESSAGES.CURRENT_PASSWORD_INCORRECT);
    });
});
