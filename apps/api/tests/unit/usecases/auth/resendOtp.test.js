"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resendOtp_usecase_1 = require("@/application/use-cases/auth/resendOtp.usecase");
const constants_1 = require("@/shared/constants");
describe('ResendOtpUseCase', () => {
    let useCase;
    let mockAuthRepo;
    let mockOtpService;
    let mockEmailService;
    beforeEach(() => {
        mockAuthRepo = {
            findUserByEmail: jest.fn(),
        };
        mockOtpService = {
            getRegistrationData: jest.fn(),
            generateOtp: jest.fn().mockResolvedValue('123456'),
            extendRegistrationData: jest.fn().mockResolvedValue(undefined),
        };
        mockEmailService = {
            sendOtpEmail: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new resendOtp_usecase_1.ResendOtpUseCase(mockAuthRepo, mockOtpService, mockEmailService);
        jest.clearAllMocks();
    });
    it('should successfully resend OTP', async () => {
        // Arrange
        mockAuthRepo.findUserByEmail.mockResolvedValue(null);
        mockOtpService.getRegistrationData.mockResolvedValue({ email: 'test@test.com' });
        // Act
        const result = await useCase.execute('test@test.com');
        // Assert
        expect(mockOtpService.generateOtp).toHaveBeenCalledWith('test@test.com');
        expect(mockOtpService.extendRegistrationData).toHaveBeenCalledWith('test@test.com');
        expect(mockEmailService.sendOtpEmail).toHaveBeenCalledWith('test@test.com', '123456');
        expect(result.message).toBe(constants_1.MESSAGES.OTP_RESENT);
    });
    it('should throw error if user is already ACTIVE', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { status: 'ACTIVE' } });
        await expect(useCase.execute('test@test.com')).rejects.toThrow(constants_1.MESSAGES.ALREADY_REGISTERED);
    });
    it('should throw error if registration data is missing and user does not exist', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue(null);
        mockOtpService.getRegistrationData.mockResolvedValue(null);
        await expect(useCase.execute('test@test.com')).rejects.toThrow(constants_1.MESSAGES.OTP_EXPIRED);
    });
});
