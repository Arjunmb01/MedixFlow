import { SendNotificationUseCase } from "@/application/use-cases/notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('SendNotificationUseCase', () => {
    let useCase: SendNotificationUseCase;
    let mockNotificationRepo: any;
    let mockCacheService: any;
    let mockSocketService: any;

    const mockInput = {
        recipientId: 'u-1',
        title: 'Test',
        message: 'Hello',
        type: NotificationType.BOOKED
    };

    beforeEach(() => {
        mockNotificationRepo = {
            create: jest.fn().mockResolvedValue({ id: 'n-1', ...mockInput }),
            getUnreadCount: jest.fn().mockResolvedValue(5),
        };
        mockCacheService = {
            setUnreadCount: jest.fn().mockResolvedValue(undefined),
            invalidateRecentNotifications: jest.fn().mockResolvedValue(undefined),
        };
        mockSocketService = {
            sendNotification: jest.fn(),
            sendUnreadCountUpdate: jest.fn(),
        };
        useCase = new SendNotificationUseCase(mockNotificationRepo, mockCacheService, mockSocketService);
        jest.clearAllMocks();
    });

    it('should successfully send notification and update state', async () => {
        const result = await useCase.execute(mockInput);

        expect(mockNotificationRepo.create).toHaveBeenCalledWith(mockInput);
        expect(mockCacheService.setUnreadCount).toHaveBeenCalledWith('u-1', 5);
        expect(mockCacheService.invalidateRecentNotifications).toHaveBeenCalledWith('u-1');
        expect(mockSocketService.sendNotification).toHaveBeenCalledWith('u-1', result);
        expect(mockSocketService.sendUnreadCountUpdate).toHaveBeenCalledWith('u-1', 5);
        expect(result.id).toBe('n-1');
    });
});
