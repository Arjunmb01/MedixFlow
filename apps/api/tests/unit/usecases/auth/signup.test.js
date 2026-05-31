"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signup_usecase_1 = require("@/application/use-cases/auth/signup.usecase");
const constants_1 = require("@/shared/constants");
describe('SignUpUseCase', () => {
    let useCase;
    let mockAuthRepo;
    let mockOtpService;
    let mockEmailService;
    let mockPasswordHasher;
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
        useCase = new signup_usecase_1.SignUpUseCase(mockAuthRepo, mockOtpService, mockEmailService, mockPasswordHasher);
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
        expect(result.message).toBe(constants_1.MESSAGES.OTP_SENT);
    });
    it('should throw error if user already exists', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ id: 'existing' });
        await expect(useCase.execute(mockData)).rejects.toThrow(constants_1.MESSAGES.USER_ALREADY_EXISTS);
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
