"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loginDoctor_usecase_1 = require("@/application/use-cases/auth/loginDoctor.usecase");
const UserRole_1 = require("@/domain/value-objects/enums/UserRole");
const constants_1 = require("@/shared/constants");
describe('LoginDoctorUseCase', () => {
    let useCase;
    let mockAuthRepo;
    let mockTokenService;
    let mockSessionService;
    let mockPasswordHasher;
    const mockUser = {
        id: 'doc-1',
        email: 'doc@test.com',
        passwordHash: 'hashed-pw',
        role: UserRole_1.UserRole.DOCTOR,
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
        useCase = new loginDoctor_usecase_1.LoginDoctorUseCase(mockAuthRepo, mockTokenService, mockSessionService, mockPasswordHasher);
        jest.clearAllMocks();
    });
    it('should login doctor successfully', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser });
        mockPasswordHasher.compare.mockResolvedValue(true);
        const result = await useCase.execute({ email: 'doc@test.com', password: 'password' });
        expect(result.accessToken).toBe('access-token');
        expect(result.user.role).toBe(UserRole_1.UserRole.DOCTOR);
        expect(mockSessionService.saveSession).toHaveBeenCalled();
    });
    it('should throw error if user is not a doctor', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, role: UserRole_1.UserRole.PATIENT } });
        await expect(useCase.execute({ email: 'pat@test.com', password: 'pw' }))
            .rejects.toThrow(constants_1.MESSAGES.LOGIN_FAILED);
    });
    it('should throw error if account is SUSPENDED', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, status: 'SUSPENDED' } });
        await expect(useCase.execute({ email: 'doc@test.com', password: 'pw' }))
            .rejects.toThrow(constants_1.MESSAGES.ACCOUNT_SUSPENDED);
    });
});
