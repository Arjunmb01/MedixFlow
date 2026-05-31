import { LoginDoctorUseCase } from "@/application/use-cases/auth/loginDoctor.usecase";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { MESSAGES } from "@/shared/constants";

describe('LoginDoctorUseCase', () => {
  let useCase: LoginDoctorUseCase;
  let mockAuthRepo: any;
  let mockTokenService: any;
  let mockSessionService: any;
  let mockPasswordHasher: any;

  const mockUser = {
    id: 'doc-1',
    email: 'doc@test.com',
    passwordHash: 'hashed-pw',
    role: UserRole.DOCTOR,
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

    useCase = new LoginDoctorUseCase(
      mockAuthRepo,
      mockTokenService,
      mockSessionService,
      mockPasswordHasher
    );

    jest.clearAllMocks();
  });

  it('should login doctor successfully', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser });
    mockPasswordHasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({ email: 'doc@test.com', password: 'password' });

    expect(result.accessToken).toBe('access-token');
    expect(result.user.role).toBe(UserRole.DOCTOR);
    expect(mockSessionService.saveSession).toHaveBeenCalled();
  });

  it('should throw error if user is not a doctor', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, role: UserRole.PATIENT } });
    await expect(useCase.execute({ email: 'pat@test.com', password: 'pw' }))
      .rejects.toThrow(MESSAGES.LOGIN_FAILED);
  });

  it('should throw error if account is SUSPENDED', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, status: 'SUSPENDED' } });
    await expect(useCase.execute({ email: 'doc@test.com', password: 'pw' }))
      .rejects.toThrow(MESSAGES.ACCOUNT_SUSPENDED);
  });
});
