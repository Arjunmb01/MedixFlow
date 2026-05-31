"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getDoctorAppointments_usecase_1 = require("@/application/use-cases/doctor/getDoctorAppointments.usecase");
describe('GetDoctorAppointmentsUseCase (Doctor version)', () => {
    let useCase;
    let mockAppointmentRepo;
    let mockDateTimeService;
    beforeEach(() => {
        mockAppointmentRepo = {
            getAppointmentsByDoctorId: jest.fn(),
        };
        mockDateTimeService = {};
        useCase = new getDoctorAppointments_usecase_1.GetDoctorAppointmentsUseCase(mockAppointmentRepo, mockDateTimeService);
        jest.clearAllMocks();
    });
    it('should call repository and map results correctly', async () => {
        // Arrange
        const mockRawResult = {
            data: [
                {
                    id: 'a-1',
                    status: 'BOOKED',
                    appointmentDate: new Date(),
                    slotStart: '10:00',
                    patient: { firstName: 'John', lastName: 'Doe' },
                    consultation: { id: 'c-1', status: 'IN_PROGRESS' }
                }
            ],
            meta: { total: 1 }
        };
        mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue(mockRawResult);
        // Act
        const result = await useCase.execute('d-1');
        // Assert
        expect(mockAppointmentRepo.getAppointmentsByDoctorId).toHaveBeenCalledWith('d-1', undefined);
        expect(result.data[0].patient.name).toBe('John Doe');
        expect(result.data[0].consultation?.status).toBe('IN_PROGRESS');
    });
    it("should correctly map medicines when a prescription is present", async () => {
        // Arrange
        const mockAppt = {
            id: "a1",
            consultation: {
                id: "c1",
                status: "COMPLETED",
                prescription: {
                    id: "pr1",
                    instructions: "Take after food",
                    medicines: [{ id: "m1", name: "Paracetamol", dosage: "500mg", frequency: "1-0-1", duration: "3 days" }]
                }
            }
        };
        mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue({ data: [mockAppt], meta: {} });
        // Act
        const result = await useCase.execute("d1");
        // Assert
        const medicines = result.data[0].consultation?.prescription?.medicines;
        expect(medicines).toHaveLength(1);
        expect(medicines[0].name).toBe("Paracetamol");
    });
    it("should return null consultation if appt.consultation is missing", async () => {
        // Arrange
        mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue({
            data: [{ id: "a1", patient: { firstName: "J", lastName: "D" } }],
            meta: {}
        });
        // Act
        const result = await useCase.execute("d1");
        // Assert
        expect(result.data[0].consultation).toBeNull();
    });
    it("should return null prescription if consultation.prescription is missing", async () => {
        // Arrange
        mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue({
            data: [{
                    id: "a1",
                    consultation: { id: "c1", status: "COMPLETED" },
                    patient: { firstName: "J", lastName: "D" }
                }],
            meta: {}
        });
        // Act
        const result = await useCase.execute("d1");
        // Assert
        expect(result.data[0].consultation?.prescription).toBeNull();
    });
    it("should handle null patient gracefully", async () => {
        // Arrange
        mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue({
            data: [{ id: "a1", patient: null }],
            meta: {}
        });
        // Act
        const result = await useCase.execute("d1");
        // Assert
        expect(result.data[0].patient.id).toBeUndefined();
        expect(result.data[0].patient.name).toBe("undefined undefined");
    });
});
