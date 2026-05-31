"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetUnreadCountUseCase_1 = require("@/application/use-cases/notification/GetUnreadCountUseCase");
describe('GetUnreadCountUseCase', () => {
    let useCase;
    let mockNotificationRepo;
    let mockCacheService;
    beforeEach(() => {
        mockNotificationRepo = {
            getUnreadCount: jest.fn(),
        };
        mockCacheService = {
            getUnreadCount: jest.fn(),
            setUnreadCount: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new GetUnreadCountUseCase_1.GetUnreadCountUseCase(mockNotificationRepo, mockCacheService);
        jest.clearAllMocks();
    });
    it('should return cached count if available', async () => {
        mockCacheService.getUnreadCount.mockResolvedValue(10);
        const result = await useCase.execute('u-1');
        expect(result).toBe(10);
        expect(mockNotificationRepo.getUnreadCount).not.toHaveBeenCalled();
    });
    it('should fetch from repo and update cache if count not cached', async () => {
        mockCacheService.getUnreadCount.mockResolvedValue(null);
        mockNotificationRepo.getUnreadCount.mockResolvedValue(5);
        const result = await useCase.execute('u-1');
        expect(result).toBe(5);
        expect(mockNotificationRepo.getUnreadCount).toHaveBeenCalledWith('u-1');
        expect(mockCacheService.setUnreadCount).toHaveBeenCalledWith('u-1', 5);
    });
});
