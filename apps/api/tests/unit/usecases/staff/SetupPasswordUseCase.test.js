"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SetupPasswordUseCase_1 = require("@/application/use-cases/staff/SetupPasswordUseCase");
const BaseDomainError_1 = require("@/domain/value-objects/errors/BaseDomainError");
describe('SetupPasswordUseCase', () => {
    let useCase;
    let mockStaffRepo;
    beforeEach(() => {
        mockStaffRepo = {
            setupPassword: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new SetupPasswordUseCase_1.SetupPasswordUseCase(mockStaffRepo);
    });
    it('should successfully setup password', async () => {
        await useCase.execute({ token: 'tok-1', password: 'new-password' });
        expect(mockStaffRepo.setupPassword).toHaveBeenCalledWith('tok-1', 'new-password');
    });
    it('should throw BusinessRuleError if token or password missing', async () => {
        await expect(useCase.execute({ token: '', password: 'pw' }))
            .rejects.toThrow(BaseDomainError_1.BusinessRuleError);
    });
});
