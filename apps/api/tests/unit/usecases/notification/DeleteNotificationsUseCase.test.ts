import { DeleteNotificationsUseCase } from "@/application/use-cases/notification/DeleteNotificationsUseCase";

describe('DeleteNotificationsUseCase', () => {
    let useCase: DeleteNotificationsUseCase;
    let mockNotificationRepo: any;
    let mockCacheService: any;
    let mockSocketService: any;

    beforeEach(() => {
        mockNotificationRepo = {
            deleteAll: jest.fn().mockResolvedValue(undefined),
        };
        mockCacheService = {
            setUnreadCount: jest.fn().mockResolvedValue(undefined),
            invalidateRecentNotifications: jest.fn().mockResolvedValue(undefined),
        };
        mockSocketService = {
            sendUnreadCountUpdate: jest.fn(),
        };
        useCase = new DeleteNotificationsUseCase(mockNotificationRepo, mockCacheService, mockSocketService);
        jest.clearAllMocks();
    });

    it('should delete all notifications and reset state', async () => {
        await useCase.execute('u-1');
        expect(mockNotificationRepo.deleteAll).toHaveBeenCalledWith('u-1');
        expect(mockCacheService.setUnreadCount).toHaveBeenCalledWith('u-1', 0);
        expect(mockSocketService.sendUnreadCountUpdate).toHaveBeenCalledWith('u-1', 0);
    });
});
