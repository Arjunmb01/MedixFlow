import { GetDoctorsUseCase } from "@/application/use-cases/staff/GetDoctorsUseCase";

describe('GetDoctorsUseCase (Staff version)', () => {
    let useCase: GetDoctorsUseCase;
    let mockStaffRepo: any;

    beforeEach(() => {
        mockStaffRepo = {
            getDoctors: jest.fn(),
        };
        useCase = new GetDoctorsUseCase(mockStaffRepo);
    });

    it('should call repository getDoctors with filters', async () => {
        const filters = { search: 'John' };
        mockStaffRepo.getDoctors.mockResolvedValue({ data: [], meta: {} });
        await useCase.execute(filters);
        expect(mockStaffRepo.getDoctors).toHaveBeenCalledWith(filters);
    });
});
