import { GetNotificationsUseCase } from "@/application/use-cases/notification/GetNotificationsUseCase";

describe('GetNotificationsUseCase', () => {
    let useCase: GetNotificationsUseCase;
    let mockNotificationRepo: any;
    let mockCacheService: any;

    beforeEach(() => {
        mockNotificationRepo = {
            getUserNotifications: jest.fn(),
        };
        mockCacheService = {
            getRecentNotifications: jest.fn(),
            setRecentNotifications: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new GetNotificationsUseCase(mockNotificationRepo, mockCacheService);
        jest.clearAllMocks();
    });

    it('should return cached notifications if available for page 1', async () => {
        const cachedData = [{ id: '1' }];
        mockCacheService.getRecentNotifications.mockResolvedValue(cachedData);

        const result = await useCase.execute('u-1', 1, 10);

        expect(mockCacheService.getRecentNotifications).toHaveBeenCalledWith('u-1');
        expect(result.data).toBe(cachedData);
        expect(mockNotificationRepo.getUserNotifications).not.toHaveBeenCalled();
    });

    it('should fetch from repository and update cache if cache miss', async () => {
        mockCacheService.getRecentNotifications.mockResolvedValue(null);
        const repoResult = { data: [{ id: '2' }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
        mockNotificationRepo.getUserNotifications.mockResolvedValue(repoResult);

        const result = await useCase.execute('u-1', 1, 10);

        expect(mockNotificationRepo.getUserNotifications).toHaveBeenCalledWith('u-1', 1, 10);
        expect(mockCacheService.setRecentNotifications).toHaveBeenCalledWith('u-1', repoResult.data);
        expect(result).toBe(repoResult);
    });

    it('should not use cache for page > 1', async () => {
        await useCase.execute('u-1', 2, 10);
        expect(mockCacheService.getRecentNotifications).not.toHaveBeenCalled();
        expect(mockNotificationRepo.getUserNotifications).toHaveBeenCalled();
    });
});
