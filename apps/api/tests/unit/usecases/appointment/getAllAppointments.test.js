"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAllAppointments_usecase_1 = require("@/application/use-cases/appointment/getAllAppointments.usecase");
describe('GetAllAppointmentsUseCase', () => {
    let useCase;
    let mockAppointmentRepo;
    beforeEach(() => {
        mockAppointmentRepo = {
            getAllAppointments: jest.fn(),
        };
        useCase = new getAllAppointments_usecase_1.GetAllAppointmentsUseCase(mockAppointmentRepo);
    });
    it('should call repository getAllAppointments with filters', async () => {
        const filter = { status: 'BOOKED' };
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
