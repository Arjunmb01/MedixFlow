import { SignUpUseCase } from "@/application/use-cases/auth/signup.usecase";
import { MESSAGES } from "@/shared/constants";

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let mockAuthRepo: any;
  let mockOtpService: any;
  let mockEmailService: any;
  let mockPasswordHasher: any;

  const mockData = {
    email: 'new@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890'
  };

  beforeEach(() => {
    mockAuthRepo = {
      findUserByEmail: jest.fn(),
    };
    mockOtpService = {
      generateOtp: jest.fn().mockResolvedValue('123456'),
    };
    mockEmailService = {
      sendOtpEmail: jest.fn().mockResolvedValue(undefined),
    };
    mockPasswordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-pw'),
    };

    useCase = new SignUpUseCase(
      mockAuthRepo,
      mockOtpService,
      mockEmailService,
      mockPasswordHasher
    );

    jest.clearAllMocks();
  });

  it('should successfully initiate signup and send OTP', async () => {
    // Arrange
    mockAuthRepo.findUserByEmail.mockResolvedValue(null);

    // Act
    const result = await useCase.execute(mockData);

    // Assert
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
    expect(mockOtpService.generateOtp).toHaveBeenCalledWith('new@test.com', expect.objectContaining({
      passwordHash: 'hashed-pw'
    }));
    expect(mockEmailService.sendOtpEmail).toHaveBeenCalledWith('new@test.com', '123456');
    expect(result.message).toBe(MESSAGES.OTP_SENT);
  });

  it('should throw error if user already exists', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue({ id: 'existing' });
    await expect(useCase.execute(mockData)).rejects.toThrow(MESSAGES.USER_ALREADY_EXISTS);
  });

  it('should handle optional password (e.g. for Google Auth flows if redirected here)', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue(null);
    await useCase.execute({ ...mockData, password: '' });
    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockOtpService.generateOtp).toHaveBeenCalledWith('new@test.com', expect.objectContaining({
      passwordHash: ""
    }));
  });
});
