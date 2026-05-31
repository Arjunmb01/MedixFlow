"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logout_usecase_1 = require("@/application/use-cases/auth/logout.usecase");
const constants_1 = require("@/shared/constants");
describe('LogoutUseCase', () => {
    let useCase;
    let mockSessionService;
    beforeEach(() => {
        mockSessionService = {
            deleteSession: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new logout_usecase_1.LogoutUseCase(mockSessionService);
        jest.clearAllMocks();
    });
    it('should successfully logout user', async () => {
        const result = await useCase.execute('u-1');
        expect(mockSessionService.deleteSession).toHaveBeenCalledWith('u-1');
        expect(result.message).toBe(constants_1.MESSAGES.LOGOUT_SUCCESS);
    });
    it('should throw error if userId is missing', async () => {
        await expect(useCase.execute('')).rejects.toThrow(constants_1.MESSAGES.USER_ID_REQUIRED);
    });
});
