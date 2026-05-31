import { LogoutUseCase } from "@/application/use-cases/auth/logout.usecase";
import { MESSAGES } from "@/shared/constants";

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockSessionService: any;

  beforeEach(() => {
    mockSessionService = {
      deleteSession: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new LogoutUseCase(mockSessionService);
    jest.clearAllMocks();
  });

  it('should successfully logout user', async () => {
    const result = await useCase.execute('u-1');
    expect(mockSessionService.deleteSession).toHaveBeenCalledWith('u-1');
    expect(result.message).toBe(MESSAGES.LOGOUT_SUCCESS);
  });

  it('should throw error if userId is missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(MESSAGES.USER_ID_REQUIRED);
  });
});
