"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getPatientAppointments_usecase_1 = require("@/application/use-cases/patient/getPatientAppointments.usecase");
describe("GetPatientAppointmentsUseCase", () => {
    let useCase;
    let mockAppointmentRepo;
    beforeEach(() => {
        mockAppointmentRepo = {
            markPastAppointmentsAsNotAttended: jest.fn(),
            getAppointmentsByPatientId: jest.fn(),
        };
        useCase = new getPatientAppointments_usecase_1.GetPatientAppointmentsUseCase(mockAppointmentRepo);
    });
    it("should mark past appointments as not attended and return appointments", async () => {
        // Arrange
        const patientId = "patient_123";
        const filter = { status: "COMPLETED" };
        const mockAppointments = [{ id: "app_1", status: "COMPLETED" }];
        mockAppointmentRepo.markPastAppointmentsAsNotAttended.mockResolvedValue(undefined);
        mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({
            data: mockAppointments,
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
        });
        // Act
        const result = await useCase.execute(patientId, filter);
        // Assert
        expect(result.data).toEqual(mockAppointments);
        expect(mockAppointmentRepo.markPastAppointmentsAsNotAttended).toHaveBeenCalledWith(patientId);
        expect(mockAppointmentRepo.getAppointmentsByPatientId).toHaveBeenCalledWith(patientId, filter);
    });
    it("should work without filter", async () => {
        // Arrange
        const patientId = "patient_123";
        mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 }
        });
        // Act
        await useCase.execute(patientId);
        // Assert
        expect(mockAppointmentRepo.getAppointmentsByPatientId).toHaveBeenCalledWith(patientId, undefined);
    });
    it("should handle invalid patient ID (repo returns null/empty)", async () => {
        // Arrange
        const patientId = "non_existent";
        mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 }
        });
        // Act
        const result = await useCase.execute(patientId);
        // Assert
        expect(result.data).toEqual([]);
    });
    it("should propagate repository errors", async () => {
        // Arrange
        mockAppointmentRepo.getAppointmentsByPatientId.mockRejectedValue(new Error("Database error"));
        // Act & Assert
        await expect(useCase.execute("id")).rejects.toThrow("Database error");
    });
});
