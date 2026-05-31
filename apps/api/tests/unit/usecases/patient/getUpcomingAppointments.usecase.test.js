"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getUpcomingAppointments_usecase_1 = require("@/application/use-cases/patient/getUpcomingAppointments.usecase");
describe("GetUpcomingAppointmentsUseCase", () => {
    let useCase;
    let mockAppointmentRepo;
    let mockDateTimeService;
    beforeEach(() => {
        mockAppointmentRepo = {
            getAppointmentsByPatientId: jest.fn(),
        };
        mockDateTimeService = {
            now: jest.fn(),
            isUpcoming: jest.fn(),
        };
        useCase = new getUpcomingAppointments_usecase_1.GetUpcomingAppointmentsUseCase(mockAppointmentRepo, mockDateTimeService);
    });
    it("should return only upcoming, non-cancelled, non-completed appointments", async () => {
        // Arrange
        const patientId = "patient_123";
        const now = new Date();
        mockDateTimeService.now.mockReturnValue(now);
        const appointments = [
            { id: "1", appointmentDate: "2023-10-01", slotStart: "10:00", status: "BOOKED" },
            { id: "2", appointmentDate: "2023-10-01", slotStart: "11:00", status: "CANCELLED" },
            { id: "3", appointmentDate: "2023-10-01", slotStart: "09:00", status: "BOOKED" }, // Past
            { id: "4", appointmentDate: "2023-10-01", slotStart: "12:00", status: "COMPLETED" },
        ];
        mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({ data: appointments });
        mockDateTimeService.isUpcoming.mockImplementation((date, slot) => {
            if (slot === "10:00" || slot === "11:00" || slot === "12:00")
                return true;
            return false;
        });
        // Act
        const result = await useCase.execute(patientId);
        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("1");
        expect(mockAppointmentRepo.getAppointmentsByPatientId).toHaveBeenCalledWith(patientId, expect.objectContaining({ isUpcoming: true, limit: 20 }));
    });
    it("should return empty array if no appointments found", async () => {
        // Arrange
        mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({ data: [] });
        // Act
        const result = await useCase.execute("id");
        // Assert
        expect(result).toEqual([]);
    });
    it("should propagate repository errors", async () => {
        // Arrange
        mockAppointmentRepo.getAppointmentsByPatientId.mockRejectedValue(new Error("Repo error"));
        // Act & Assert
        await expect(useCase.execute("id")).rejects.toThrow("Repo error");
    });
});
