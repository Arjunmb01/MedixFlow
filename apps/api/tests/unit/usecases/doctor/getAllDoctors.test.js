"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAllDoctors_usecase_1 = require("@/application/use-cases/doctor/getAllDoctors.usecase");
describe('GetAllDoctorsUseCase', () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            getDoctorsFiltered: jest.fn(),
        };
        useCase = new getAllDoctors_usecase_1.GetAllDoctorsUseCase(mockDoctorRepo);
    });
    it('should call repository getDoctorsFiltered', async () => {
        const filters = { specialty: 'Cardiology' };
        const mockResult = { data: [], meta: {} };
        mockDoctorRepo.getDoctorsFiltered.mockResolvedValue(mockResult);
        const result = await useCase.execute(filters);
        expect(mockDoctorRepo.getDoctorsFiltered).toHaveBeenCalledWith(filters);
        expect(result).toBe(mockResult);
    });
    it('should return empty results if no doctors match filters', async () => {
        const filters = { specialty: 'NonExistent' };
        const mockResult = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        mockDoctorRepo.getDoctorsFiltered.mockResolvedValue(mockResult);
        const result = await useCase.execute(filters);
        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
