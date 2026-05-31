"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uploadLabTest_usecase_1 = require("@/application/use-cases/consultation/uploadLabTest.usecase");
const notification_types_1 = require("@/domain/value-objects/types/notification.types");
describe('UploadLabTestUseCase', () => {
    let useCase;
    let mockConsultationRepo;
    let mockSendNotificationUseCase;
    beforeEach(() => {
        mockConsultationRepo = {
            findById: jest.fn(),
            uploadLabTestReport: jest.fn().mockResolvedValue(undefined),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new uploadLabTest_usecase_1.UploadLabTestUseCase(mockConsultationRepo, mockSendNotificationUseCase);
        jest.clearAllMocks();
    });
    it('should successfully upload lab test report', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-1', patientId: 'p-1', patient: { firstName: 'John' } });
        await useCase.execute('c-1', 'lab-1', 'p-1', 'http://report.pdf');
        expect(mockConsultationRepo.uploadLabTestReport).toHaveBeenCalledWith('lab-1', 'http://report.pdf');
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'd-1',
            type: notification_types_1.NotificationType.LAB_TEST
        }));
    });
    it('should throw error if unauthorized patient', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', patientId: 'p-2' });
        await expect(useCase.execute('c-1', 'lab-1', 'p-1', 'url'))
            .rejects.toThrow("Unauthorized");
    });
});
