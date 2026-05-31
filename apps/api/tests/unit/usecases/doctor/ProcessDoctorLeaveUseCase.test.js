"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProcessDoctorLeaveUseCase_1 = require("@/application/use-cases/doctor/ProcessDoctorLeaveUseCase");
describe('ProcessDoctorLeaveUseCase', () => {
    let useCase;
    let mockAppointmentRepo;
    let mockSendNotificationUseCase;
    let mockDateTimeService;
    beforeEach(() => {
        mockAppointmentRepo = {
            findImpactedAppointments: jest.fn(),
            findById: jest.fn(),
            createAuditLog: jest.fn(),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        mockDateTimeService = {};
        useCase = new ProcessDoctorLeaveUseCase_1.ProcessDoctorLeaveUseCase(mockAppointmentRepo, mockSendNotificationUseCase, mockDateTimeService);
        jest.clearAllMocks();
    });
    it('should process leave and notify patients of impacted appointments', async () => {
        // Arrange
        const doctorId = 'd-1';
        const start = new Date();
        const end = new Date();
        mockAppointmentRepo.findImpactedAppointments.mockResolvedValue(['a-1', 'a-2']);
        mockAppointmentRepo.findById.mockResolvedValue({
            id: 'a-1',
            patientId: 'p-1',
            status: 'BOOKED',
            appointmentDate: new Date(),
            doctor: { lastName: 'Smith' }
        });
        // Act
        const result = await useCase.execute(doctorId, start, end, 'Sick leave');
        // Assert
        expect(mockAppointmentRepo.findImpactedAppointments).toHaveBeenCalledWith(doctorId, start, end);
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2); // Called for both a-1 and a-2 (mocked same for both)
        expect(mockAppointmentRepo.createAuditLog).toHaveBeenCalledTimes(2);
        expect(result.processed).toBe(2);
    });
    it('should return 0 processed if no appointments impacted', async () => {
        mockAppointmentRepo.findImpactedAppointments.mockResolvedValue([]);
        const result = await useCase.execute('d-1', new Date(), new Date(), 'Reason');
        expect(result.processed).toBe(0);
        expect(mockSendNotificationUseCase.execute).not.toHaveBeenCalled();
    });
});
