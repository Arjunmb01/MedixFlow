import { RequestLabTestUseCase } from "@/application/use-cases/consultation/requestLabTest.usecase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('RequestLabTestUseCase', () => {
    let useCase: RequestLabTestUseCase;
    let mockConsultationRepo: any;
    let mockSendNotificationUseCase: any;

    beforeEach(() => {
        mockConsultationRepo = {
            findById: jest.fn(),
            requestLabTests: jest.fn().mockResolvedValue(undefined),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        useCase = new RequestLabTestUseCase(mockConsultationRepo, mockSendNotificationUseCase);
        jest.clearAllMocks();
    });

    it('should successfully request lab tests', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-1', patientId: 'p-1', doctor: { lastName: 'Smith' } });

        await useCase.execute('c-1', 'd-1', [{ testName: 'Blood Test' }]);

        expect(mockConsultationRepo.requestLabTests).toHaveBeenCalledWith('c-1', [{ testName: 'Blood Test' }]);
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'p-1',
            type: NotificationType.LAB_TEST
        }));
    });

    it('should throw error if unauthorized doctor', async () => {
        mockConsultationRepo.findById.mockResolvedValue({ id: 'c-1', doctorId: 'd-2' });
        await expect(useCase.execute('c-1', 'd-1', []))
            .rejects.toThrow("Unauthorized");
    });
});
