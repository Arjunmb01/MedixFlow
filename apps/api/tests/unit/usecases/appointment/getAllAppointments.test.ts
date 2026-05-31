import { GetAllAppointmentsUseCase } from "@/application/use-cases/appointment/getAllAppointments.usecase";

describe('GetAllAppointmentsUseCase', () => {
    let useCase: GetAllAppointmentsUseCase;
    let mockAppointmentRepo: any;

    beforeEach(() => {
        mockAppointmentRepo = {
            getAllAppointments: jest.fn(),
        };
        useCase = new GetAllAppointmentsUseCase(mockAppointmentRepo);
    });

    it('should call repository getAllAppointments with filters', async () => {
        const filter = { status: 'BOOKED' } as any;
        const mockAppointments = [{ id: '1' }];
        mockAppointmentRepo.getAllAppointments.mockResolvedValue(mockAppointments);

        const result = await useCase.execute(filter);

        expect(mockAppointmentRepo.getAllAppointments).toHaveBeenCalledWith(filter);
        expect(result).toBe(mockAppointments);
    });

    it('should call repository with undefined if no filter provided', async () => {
        await useCase.execute();
        expect(mockAppointmentRepo.getAllAppointments).toHaveBeenCalledWith(undefined);
    });
});
