"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getDoctorQueue_usecase_1 = require("@/application/use-cases/consultation/getDoctorQueue.usecase");
describe('GetDoctorQueueUseCase', () => {
    let useCase;
    let mockConsultationRepo;
    beforeEach(() => {
        mockConsultationRepo = {
            getDoctorQueue: jest.fn(),
        };
        useCase = new getDoctorQueue_usecase_1.GetDoctorQueueUseCase(mockConsultationRepo);
    });
    it('should call repository getDoctorQueue with doctorId and date', async () => {
        const date = new Date();
        const mockQueue = [{ id: '1' }];
        mockConsultationRepo.getDoctorQueue.mockResolvedValue(mockQueue);
        const result = await useCase.execute('d-1', date);
        expect(mockConsultationRepo.getDoctorQueue).toHaveBeenCalledWith('d-1', date);
        expect(result).toBe(mockQueue);
    });
});
