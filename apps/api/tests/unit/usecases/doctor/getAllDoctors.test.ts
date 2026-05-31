import { GetAllDoctorsUseCase } from "@/application/use-cases/doctor/getAllDoctors.usecase";

describe('GetAllDoctorsUseCase', () => {
    let useCase: GetAllDoctorsUseCase;
    let mockDoctorRepo: any;

    beforeEach(() => {
        mockDoctorRepo = {
            getDoctorsFiltered: jest.fn(),
        };
        useCase = new GetAllDoctorsUseCase(mockDoctorRepo);
    });

    it('should call repository getDoctorsFiltered', async () => {
        const filters = { specialty: 'Cardiology' } as any;
        const mockResult = { data: [], meta: {} } as any;
        mockDoctorRepo.getDoctorsFiltered.mockResolvedValue(mockResult);
        const result = await useCase.execute(filters);
        expect(mockDoctorRepo.getDoctorsFiltered).toHaveBeenCalledWith(filters);
        expect(result).toBe(mockResult);
    });

    it('should return empty results if no doctors match filters', async () => {
        const filters = { specialty: 'NonExistent' } as any;
        const mockResult = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } } as any;
        mockDoctorRepo.getDoctorsFiltered.mockResolvedValue(mockResult);
        
        const result = await useCase.execute(filters);
        
        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
