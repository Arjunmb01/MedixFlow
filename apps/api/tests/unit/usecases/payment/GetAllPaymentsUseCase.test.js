"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetAllPaymentsUseCase_1 = require("@/application/use-cases/payment/GetAllPaymentsUseCase");
describe('GetAllPaymentsUseCase', () => {
    let useCase;
    let mockPaymentRepo;
    beforeEach(() => {
        mockPaymentRepo = {
            findAll: jest.fn(),
        };
        useCase = new GetAllPaymentsUseCase_1.GetAllPaymentsUseCase(mockPaymentRepo);
    });
    it('should call repository findAll with filters', async () => {
        const filters = { page: 1, limit: 10 };
        mockPaymentRepo.findAll.mockResolvedValue({ data: [], meta: {} });
        await useCase.execute(filters);
        expect(mockPaymentRepo.findAll).toHaveBeenCalledWith(filters);
    });
});
