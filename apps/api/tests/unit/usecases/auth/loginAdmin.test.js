"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loginAdmin_usecase_1 = require("@/application/use-cases/auth/loginAdmin.usecase");
const UserRole_1 = require("@/domain/value-objects/enums/UserRole");
const constants_1 = require("@/shared/constants");
describe('LoginAdminUseCase', () => {
    let useCase;
    let mockAuthRepo;
    let mockTokenService;
    let mockSessionService;
    let mockPasswordHasher;
    const mockUser = {
        id: 'admin-1',
        email: 'admin@test.com',
        passwordHash: 'hashed-pw',
        role: UserRole_1.UserRole.ADMIN,
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
        useCase = new loginAdmin_usecase_1.LoginAdminUseCase(mockAuthRepo, mockTokenService, mockSessionService, mockPasswordHasher);
        jest.clearAllMocks();
    });
    it('should login admin successfully', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: mockUser });
        mockPasswordHasher.compare.mockResolvedValue(true);
        const result = await useCase.execute({ email: 'admin@test.com', password: 'password' });
        expect(result.accessToken).toBe('access-token');
        expect(result.user.role).toBe(UserRole_1.UserRole.ADMIN);
        expect(mockSessionService.saveSession).toHaveBeenCalledWith('admin-1', 'refresh-token');
    });
    it('should throw error if user is not an admin', async () => {
        mockAuthRepo.findUserByEmail.mockResolvedValue({ user: { ...mockUser, role: UserRole_1.UserRole.PATIENT } });
        await expect(useCase.execute({ email: 'pat@test.com', password: 'pw' }))
            .rejects.toThrow(constants_1.MESSAGES.INVALID_ROLE_ADMIN);
    });
});
