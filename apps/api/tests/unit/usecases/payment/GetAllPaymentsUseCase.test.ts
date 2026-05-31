import { GetAllPaymentsUseCase } from "@/application/use-cases/payment/GetAllPaymentsUseCase";

describe('GetAllPaymentsUseCase', () => {
    let useCase: GetAllPaymentsUseCase;
    let mockPaymentRepo: any;

    beforeEach(() => {
        mockPaymentRepo = {
            findAll: jest.fn(),
        };
        useCase = new GetAllPaymentsUseCase(mockPaymentRepo);
    });

    it('should call repository findAll with filters', async () => {
        const filters = { page: 1, limit: 10 };
        mockPaymentRepo.findAll.mockResolvedValue({ data: [], meta: {} });
        await useCase.execute(filters);
        expect(mockPaymentRepo.findAll).toHaveBeenCalledWith(filters);
    });
});
