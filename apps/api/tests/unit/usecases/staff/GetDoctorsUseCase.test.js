"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetDoctorsUseCase_1 = require("@/application/use-cases/staff/GetDoctorsUseCase");
describe('GetDoctorsUseCase (Staff version)', () => {
    let useCase;
    let mockStaffRepo;
    beforeEach(() => {
        mockStaffRepo = {
            getDoctors: jest.fn(),
        };
        useCase = new GetDoctorsUseCase_1.GetDoctorsUseCase(mockStaffRepo);
    });
    it('should call repository getDoctors with filters', async () => {
        const filters = { search: 'John' };
        mockStaffRepo.getDoctors.mockResolvedValue({ data: [], meta: {} });
        await useCase.execute(filters);
        expect(mockStaffRepo.getDoctors).toHaveBeenCalledWith(filters);
    });
});
