"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyOtp_usecase_1 = require("@/application/use-cases/auth/verifyOtp.usecase");
const constants_1 = require("@/shared/constants");
describe('VerifyOtpUseCase', () => {
    let useCase;
    let mockAuthRepo;
    let mockOtpService;
    const mockUserData = {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        passwordHash: 'hashed-pw'
    };
    beforeEach(() => {
        mockAuthRepo = {
            createPatient: jest.fn().mockResolvedValue({ patientId: 'pat-1' }),
        };
        mockOtpService = {
            verifyOtp: jest.fn().mockResolvedValue(true),
            getRegistrationData: jest.fn(),
            clearRegistrationData: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new verifyOtp_usecase_1.VerifyOtpUseCase(mockAuthRepo, mockOtpService);
        jest.clearAllMocks();
    });
    it('should successfully verify OTP and create patient', async () => {
        // Arrange
        mockOtpService.getRegistrationData.mockResolvedValue(mockUserData);
        // Act
        const result = await useCase.execute({ email: 'test@test.com', otp: '123456' });
        // Assert
        expect(mockOtpService.verifyOtp).toHaveBeenCalledWith('test@test.com', '123456');
        expect(mockAuthRepo.createPatient).toHaveBeenCalledWith(mockUserData);
        expect(mockOtpService.clearRegistrationData).toHaveBeenCalledWith('test@test.com');
        expect(result.patientId).toBe('pat-1');
        expect(result.message).toBe(constants_1.MESSAGES.OTP_VERIFIED);
    });
    it('should throw error if registration data is missing (expired)', async () => {
        mockOtpService.getRegistrationData.mockResolvedValue(null);
        await expect(useCase.execute({ email: 'test@test.com', otp: '123456' }))
            .rejects.toThrow(constants_1.MESSAGES.OTP_EXPIRED);
    });
    it('should propagate error if OTP verification fails', async () => {
        mockOtpService.verifyOtp.mockRejectedValue(new Error("Invalid OTP"));
        await expect(useCase.execute({ email: 'test@test.com', otp: 'wrong' }))
            .rejects.toThrow("Invalid OTP");
    });
});
