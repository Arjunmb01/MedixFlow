"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleAuth_usecase_1 = require("@/application/use-cases/auth/googleAuth.usecase");
const UserRole_1 = require("@/domain/value-objects/enums/UserRole");
const constants_1 = require("@/shared/constants");
describe('GoogleAuthUseCase', () => {
    let useCase;
    let mockAuthRepo;
    let mockTokenService;
    let mockSessionService;
    let mockGoogleAuthService;
    const mockGoogleUser = {
        email: 'google@test.com',
        firstName: 'Google',
        lastName: 'User'
    };
    const mockUser = {
        id: 'u-1',
        email: 'google@test.com',
        role: UserRole_1.UserRole.PATIENT,
        status: 'ACTIVE'
    };
    beforeEach(() => {
        mockAuthRepo = {
            findUserByEmail: jest.fn(),
            createGooglePatient: jest.fn(),
        };
        mockTokenService = {
            generateAccessToken: jest.fn().mockReturnValue('access-token'),
            generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
        };
        mockSessionService = {
            saveSession: jest.fn().mockResolvedValue(undefined),
        };
        mockGoogleAuthService = {
            verifyToken: jest.fn().mockResolvedValue(mockGoogleUser),
        };
        useCase = new googleAuth_usecase_1.GoogleAuthUseCase(mockAuthRepo, mockTokenService, mockSessionService, mockGoogleAuthService);
        jest.clearAllMocks();
    });
    it('should successfully login existing google user', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser, patientId: 'pat-1' });
        const result = await useCase.execute('google-token');
        expect(mockGoogleAuthService.verifyToken).toHaveBeenCalledWith('google-token');
        expect(result.accessToken).toBe('access-token');
        expect(mockAuthRepo.createGooglePatient).not.toHaveBeenCalled();
    });
    it('should create and login new google user if not found', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue(null);
        mockAuthRepo.createGooglePatient.mockResolvedValue({ user: mockUser, patientId: 'pat-1' });
        const result = await useCase.execute('google-token');
        expect(mockAuthRepo.createGooglePatient).toHaveBeenCalledWith(expect.objectContaining({
            email: 'google@test.com'
        }));
        expect(result.patientId).toBe('pat-1');
    });
    it('should throw error if role is not patient', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, role: UserRole_1.UserRole.DOCTOR } });
        await expect(useCase.execute('token')).rejects.toThrow("It looks like you have a Doctor account");
    });
    it('should throw error if account is blocked', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, status: 'INACTIVE' } });
        await expect(useCase.execute('token')).rejects.toThrow(constants_1.MESSAGES.ACCOUNT_BLOCKED);
    });
});
