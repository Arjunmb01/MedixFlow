import { GetAppointmentByIdUseCase } from "@/application/use-cases/appointment/getAppointmentById.usecase";

describe('GetAppointmentByIdUseCase', () => {
    let useCase: GetAppointmentByIdUseCase;
    let mockAppointmentRepo: any;

    beforeEach(() => {
        mockAppointmentRepo = {
            findById: jest.fn(),
        };
        useCase = new GetAppointmentByIdUseCase(mockAppointmentRepo);
    });

    it('should call repository findById with id', async () => {
        const id = 'apt-1';
        const mockAppointment = { id } as any;
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);

        const result = await useCase.execute(id);

        expect(mockAppointmentRepo.findById).toHaveBeenCalledWith(id);
        expect(result).toBe(mockAppointment);
    });

    it('should return null if appointment not found', async () => {
        mockAppointmentRepo.findById.mockResolvedValue(null);
        const result = await useCase.execute('none');
        expect(result).toBeNull();
    });
});
