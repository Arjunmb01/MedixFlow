import { RefreshTokenUseCase } from "@/application/use-cases/auth/refreshToken.usecase";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { MESSAGES } from "@/shared/constants";

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockSessionService: any;
  let mockAuthRepo: any;
  let mockTokenService: any;

  const mockPayload = { id: 'u-1', role: UserRole.PATIENT, email: 'test@test.com' };
  const mockUser = { id: 'u-1', email: 'test@test.com', status: 'ACTIVE' };

  beforeEach(() => {
    mockSessionService = {
      getSession: jest.fn(),
      deleteSession: jest.fn().mockResolvedValue(undefined),
    };
    mockAuthRepo = {
      findUserById: jest.fn(),
    };
    mockTokenService = {
      verifyRefreshToken: jest.fn().mockReturnValue(mockPayload),
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
    };

    useCase = new RefreshTokenUseCase(mockSessionService, mockAuthRepo, mockTokenService);
    jest.clearAllMocks();
  });

  it('should successfully refresh access token', async () => {
    // Arrange
    mockSessionService.getSession.mockResolvedValue('valid-refresh-token');
    mockAuthRepo.findUserById.mockResolvedValue({ user: mockUser, patientId: 'pat-1' });

    // Act
    const result = await useCase.execute('valid-refresh-token', UserRole.PATIENT);

    // Assert
    expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith('u-1', UserRole.PATIENT, 'test@test.com');
    expect(result.accessToken).toBe('new-access-token');
    expect(result.patientId).toBe('pat-1');
  });

  it('should throw error if refresh token is missing', async () => {
    await expect(useCase.execute('', UserRole.PATIENT)).rejects.toThrow(MESSAGES.REFRESH_TOKEN_REQUIRED);
  });

  it('should throw error if role mismatch', async () => {
    mockTokenService.verifyRefreshToken.mockReturnValue({ ...mockPayload, role: UserRole.DOCTOR });
    await expect(useCase.execute('token', UserRole.PATIENT)).rejects.toThrow(MESSAGES.INVALID_ROLE_SESSION);
  });

  it('should throw error if session expired or token mismatch', async () => {
    mockSessionService.getSession.mockResolvedValue('different-token');
    await expect(useCase.execute('token', UserRole.PATIENT)).rejects.toThrow(MESSAGES.SESSION_EXPIRED);
  });

  it('should throw error and delete session if account is blocked/inactive', async () => {
    mockSessionService.getSession.mockResolvedValue('token');
    mockAuthRepo.findUserById.mockResolvedValue({ user: { ...mockUser, status: 'INACTIVE' } });

    await expect(useCase.execute('token', UserRole.PATIENT)).rejects.toThrow(MESSAGES.ACCOUNT_BLOCKED);
    expect(mockSessionService.deleteSession).toHaveBeenCalledWith('u-1');
  });
});
