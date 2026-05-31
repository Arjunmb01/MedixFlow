import { LoginAdminUseCase } from "@/application/use-cases/auth/loginAdmin.usecase";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { MESSAGES } from "@/shared/constants";

describe('LoginAdminUseCase', () => {
  let useCase: LoginAdminUseCase;
  let mockAuthRepo: any;
  let mockTokenService: any;
  let mockSessionService: any;
  let mockPasswordHasher: any;

  const mockUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    passwordHash: 'hashed-pw',
    role: UserRole.ADMIN,
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

    useCase = new LoginAdminUseCase(
      mockAuthRepo,
      mockTokenService,
      mockSessionService,
      mockPasswordHasher
    );

    jest.clearAllMocks();
  });

  it('should login admin successfully', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser });
    mockPasswordHasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({ email: 'admin@test.com', password: 'password' });

    expect(result.accessToken).toBe('access-token');
    expect(result.user.role).toBe(UserRole.ADMIN);
    expect(mockSessionService.saveSession).toHaveBeenCalledWith('admin-1', 'refresh-token');
  });

  it('should throw error if user is not an admin', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, role: UserRole.PATIENT } });
    await expect(useCase.execute({ email: 'pat@test.com', password: 'pw' }))
      .rejects.toThrow(MESSAGES.INVALID_ROLE_ADMIN);
  });
});
