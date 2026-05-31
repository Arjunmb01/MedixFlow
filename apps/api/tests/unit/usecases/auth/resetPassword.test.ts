import { ResetPasswordUseCase } from "@/application/use-cases/auth/resetPassword.usecase";
import { MESSAGES } from "@/shared/constants";

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockAuthRepo: any;
  let mockPasswordHasher: any;

  beforeEach(() => {
    mockAuthRepo = {
      findPasswordResetToken: jest.fn(),
      updateUserPassword: jest.fn().mockResolvedValue(undefined),
      deletePasswordResetToken: jest.fn().mockResolvedValue(undefined),
    };
    mockPasswordHasher = {
      hash: jest.fn().mockResolvedValue('new-hash'),
    };

    useCase = new ResetPasswordUseCase(mockAuthRepo, mockPasswordHasher);
    jest.clearAllMocks();
  });

  it('should successfully reset password with valid token', async () => {
    // Arrange
    const mockToken = { userId: 'u-1', expiresAt: new Date(Date.now() + 10000) };
    mockAuthRepo.findPasswordResetToken.mockResolvedValue(mockToken);

    // Act
    const result = await useCase.execute({ token: 'valid-token', password: 'new-password' });

    // Assert
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('new-password');
    expect(mockAuthRepo.updateUserPassword).toHaveBeenCalledWith('u-1', 'new-hash');
    expect(mockAuthRepo.deletePasswordResetToken).toHaveBeenCalledWith('valid-token');
    expect(result.message).toBe(MESSAGES.PASSWORD_RESET_SUCCESS);
  });

  it('should throw error if token not found', async () => {
    mockAuthRepo.findPasswordResetToken.mockResolvedValue(null);
    await expect(useCase.execute({ token: 'invalid', password: 'pw' }))
      .rejects.toThrow(MESSAGES.INVALID_RESET_TOKEN);
  });

  it('should throw error if token expired', async () => {
    const expiredToken = { userId: 'u-1', expiresAt: new Date(Date.now() - 10000) };
    mockAuthRepo.findPasswordResetToken.mockResolvedValue(expiredToken);
    await expect(useCase.execute({ token: 'expired', password: 'pw' }))
      .rejects.toThrow(MESSAGES.INVALID_RESET_TOKEN);
  });
});
