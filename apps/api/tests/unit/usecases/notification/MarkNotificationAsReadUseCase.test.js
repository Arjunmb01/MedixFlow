"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarkNotificationAsReadUseCase_1 = require("@/application/use-cases/notification/MarkNotificationAsReadUseCase");
describe('MarkNotificationAsReadUseCase', () => {
    let useCase;
    let mockNotificationRepo;
    let mockCacheService;
    let mockSocketService;
    beforeEach(() => {
        mockNotificationRepo = {
            markAsRead: jest.fn().mockResolvedValue(undefined),
            markAllAsRead: jest.fn().mockResolvedValue(undefined),
            getUnreadCount: jest.fn().mockResolvedValue(0),
        };
        mockCacheService = {
            setUnreadCount: jest.fn().mockResolvedValue(undefined),
            invalidateRecentNotifications: jest.fn().mockResolvedValue(undefined),
        };
        mockSocketService = {
            sendUnreadCountUpdate: jest.fn(),
        };
        useCase = new MarkNotificationAsReadUseCase_1.MarkNotificationAsReadUseCase(mockNotificationRepo, mockCacheService, mockSocketService);
        jest.clearAllMocks();
    });
    it('should mark single notification as read', async () => {
        await useCase.execute('u-1', 'n-1');
        expect(mockNotificationRepo.markAsRead).toHaveBeenCalledWith('n-1');
        expect(mockNotificationRepo.markAllAsRead).not.toHaveBeenCalled();
        expect(mockCacheService.setUnreadCount).toHaveBeenCalled();
    });
    it('should mark all notifications as read if no id provided', async () => {
        await useCase.execute('u-1');
        expect(mockNotificationRepo.markAllAsRead).toHaveBeenCalledWith('u-1');
        expect(mockNotificationRepo.markAsRead).not.toHaveBeenCalled();
    });
});
