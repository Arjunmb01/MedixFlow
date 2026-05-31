import { LoginPatientUseCase } from "@/application/use-cases/auth/loginPatient.usecase";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { MESSAGES } from "@/shared/constants";

describe('LoginPatientUseCase', () => {
  let useCase: LoginPatientUseCase;
  let mockAuthRepo: any;
  let mockTokenService: any;
  let mockSessionService: any;
  let mockPasswordHasher: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@patient.com',
    passwordHash: 'hashed-pw',
    role: UserRole.PATIENT,
    status: 'ACTIVE'
  };

  beforeEach(() => {
    mockAuthRepo = {
      findUserByEmail: jest.fn(),
    };
    mockTokenService = {
      generateAccessToken: jest.fn().mockReturnValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
    };
    mockSessionService = {
      saveSession: jest.fn().mockResolvedValue(undefined),
    };
    mockPasswordHasher = {
      compare: jest.fn(),
    };

    useCase = new LoginPatientUseCase(
      mockAuthRepo,
      mockTokenService,
      mockSessionService,
      mockPasswordHasher
    );

    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    // Arrange
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser, patientId: 'pat-1' });
    mockPasswordHasher.compare.mockResolvedValue(true);

    // Act
    const result = await useCase.execute({ email: 'test@patient.com', password: 'password' });

    // Assert
    expect(mockTokenService.generateAccessToken).toHaveBeenCalled();
    expect(mockSessionService.saveSession).toHaveBeenCalledWith('user-1', 'refresh-token');
    expect(result.accessToken).toBe('access-token');
    expect(result.patientId).toBe('pat-1');
  });

  it('should throw error if user not found', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue(null);
    await expect(useCase.execute({ email: 'none@test.com', password: 'pw' }))
      .rejects.toThrow(MESSAGES.INVALID_ROLE_PATIENT);
  });

  it('should throw error for incorrect password', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser, patientId: 'pat-1' });
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'test@patient.com', password: 'wrong' }))
      .rejects.toThrow(MESSAGES.LOGIN_FAILED);
  });

  it('should throw specific error if user is a doctor', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ 
      user: { ...mockUser, role: UserRole.DOCTOR },
      patientId: null 
    });
    mockPasswordHasher.compare.mockResolvedValue(true);

    await expect(useCase.execute({ email: 'doc@test.com', password: 'pw' }))
      .rejects.toThrow("It looks like you have a Doctor account");
  });

  it('should throw error if account is SUSPENDED', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ 
      user: { ...mockUser, status: 'SUSPENDED' },
      patientId: 'pat-1'
    });

    await expect(useCase.execute({ email: 'test@patient.com', password: 'pw' }))
      .rejects.toThrow(MESSAGES.ACCOUNT_SUSPENDED);
  });
});
