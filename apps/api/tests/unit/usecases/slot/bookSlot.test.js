"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookSlot_usecase_1 = require("@/application/use-cases/slot/bookSlot.usecase");
const BaseDomainError_1 = require("@/domain/value-objects/errors/BaseDomainError");
describe('BookSlotUseCase', () => {
    let useCase;
    let mockAppointmentRepo;
    beforeEach(() => {
        mockAppointmentRepo = {
            bookAtomic: jest.fn(),
        };
        useCase = new bookSlot_usecase_1.BookSlotUseCase(mockAppointmentRepo);
    });
    it('should successfully book a slot', async () => {
        const input = { doctorId: 'd-1', patientId: 'p-1', startTime: new Date(), endTime: new Date() };
        mockAppointmentRepo.bookAtomic.mockResolvedValue({ id: 'a-1' });
        const result = await useCase.execute(input);
        expect(mockAppointmentRepo.bookAtomic).toHaveBeenCalled();
        expect(result.id).toBe('a-1');
    });
    it('should throw BusinessRuleError if slot is already booked', async () => {
        mockAppointmentRepo.bookAtomic.mockRejectedValue(new Error("SLOT_ALREADY_BOOKED"));
        const input = { doctorId: 'd-1', patientId: 'p-1', startTime: new Date(), endTime: new Date() };
        await expect(useCase.execute(input))
            .rejects.toThrow(BaseDomainError_1.BusinessRuleError);
    });
    it('should rethrow unexpected errors from bookAtomic', async () => {
        // Arrange
        mockAppointmentRepo.bookAtomic.mockRejectedValue(new Error("DATABASE_ERROR"));
        // Act & Assert
        await expect(useCase.execute({
            doctorId: "d1",
            patientId: "p1",
            startTime: new Date(),
            endTime: new Date()
        })).rejects.toThrow("DATABASE_ERROR");
    });
});
