import { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgotPassword.usecase";
import { MESSAGES } from "@/shared/constants";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let mockAuthRepo: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockAuthRepo = {
      findUserByEmail: jest.fn(),
      createPasswordResetToken: jest.fn().mockResolvedValue(undefined),
      findPatientProfileByUserId: jest.fn(),
      findDoctorProfileByUserId: jest.fn(),
    };
    mockEmailService = {
      sendForgotPasswordEmail: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ForgotPasswordUseCase(mockAuthRepo, mockEmailService);
    jest.clearAllMocks();
  });

  it('should send email and return confirm message if user exists', async () => {
    // Arrange
    const mockUser = { id: 'u-1', email: 'test@test.com', role: UserRole.PATIENT };
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser });
    mockAuthRepo.findPatientProfileByUserId.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });

    // Act
    const result = await useCase.execute({ email: 'test@test.com' });

    // Assert
    expect(mockAuthRepo.createPasswordResetToken).toHaveBeenCalledWith('u-1', expect.any(String), expect.any(Date));
    expect(mockEmailService.sendForgotPasswordEmail).toHaveBeenCalledWith(
      'test@test.com',
      expect.any(String),
      'John Doe'
    );
    expect(result.message).toBe(MESSAGES.FORGOT_PASSWORD_CONFIRM);
  });

  it('should return confirm message but not send email if user does not exist', async () => {
    mockAuthRepo.findUserByEmail.mockResolvedValue(null);
    const result = await useCase.execute({ email: 'unknown@test.com' });
    expect(mockEmailService.sendForgotPasswordEmail).not.toHaveBeenCalled();
    expect(result.message).toBe(MESSAGES.FORGOT_PASSWORD_CONFIRM);
  });

  it('should handle doctor profile naming', async () => {
    const mockUser = { id: 'u-1', email: 'doc@test.com', role: UserRole.DOCTOR };
    mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser });
    mockAuthRepo.findDoctorProfileByUserId.mockResolvedValue({ lastName: 'Smith' });

    await useCase.execute({ email: 'doc@test.com' });

    expect(mockEmailService.sendForgotPasswordEmail).toHaveBeenCalledWith(
      'doc@test.com',
      expect.any(String),
      'Dr. Smith'
    );
  });
});
