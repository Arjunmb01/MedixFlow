import { UploadLabTestUseCase } from "@/application/use-cases/consultation/uploadLabTest.usecase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('UploadLabTestUseCase', () => {
    let useCase: UploadLabTestUseCase;
    let mockConsultationRepo: any;
    let mockSendNotificationUseCase: any;

    beforeEach(() => {
        mockConsultationRepo = {
            findById: jest.fn(),
            uploadLabTestReport: jest.fn().mockResolvedValue(undefined),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new UploadLabTestUseCase(mockConsultationRepo, mockSendNotificationUseCase);
        jest.clearAllMocks();
    });

    it('should successfully upload lab test report', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-1', patientId: 'p-1', patient: { firstName: 'John' } });

        await useCase.execute('c-1', 'lab-1', 'p-1', 'http://report.pdf');

        expect(mockConsultationRepo.uploadLabTestReport).toHaveBeenCalledWith('lab-1', 'http://report.pdf');
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'd-1',
            type: NotificationType.LAB_TEST
        }));
    });

    it('should throw error if unauthorized patient', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', patientId: 'p-2' });
        await expect(useCase.execute('c-1', 'lab-1', 'p-1', 'url'))
            .rejects.toThrow("Unauthorized");
    });
});
