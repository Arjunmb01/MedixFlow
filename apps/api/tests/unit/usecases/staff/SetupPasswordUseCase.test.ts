import { SetupPasswordUseCase } from "@/application/use-cases/staff/SetupPasswordUseCase";
import { BusinessRuleError } from "@/domain/value-objects/errors/BaseDomainError";

describe('SetupPasswordUseCase', () => {
    let useCase: SetupPasswordUseCase;
    let mockStaffRepo: any;

    beforeEach(() => {
        mockStaffRepo = {
            setupPassword: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new SetupPasswordUseCase(mockStaffRepo);
    });

    it('should successfully setup password', async () => {
        await useCase.execute({ token: 'tok-1', password: 'new-password' });
        expect(mockStaffRepo.setupPassword).toHaveBeenCalledWith('tok-1', 'new-password');
    });

    it('should throw BusinessRuleError if token or password missing', async () => {
        await expect(useCase.execute({ token: '', password: 'pw' }))
            .rejects.toThrow(BusinessRuleError);
    });
});
