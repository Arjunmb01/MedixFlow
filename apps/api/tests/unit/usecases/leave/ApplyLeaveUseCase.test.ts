import { ApplyLeaveUseCase } from "@/application/use-cases/leave/ApplyLeaveUseCase";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";

describe('ApplyLeaveUseCase', () => {
  let useCase: ApplyLeaveUseCase;
  let mockLeaveRepo: any;
  let mockAppointmentRepo: any;
  let mockSendNotificationUseCase: any;
  let mockCancelAppointmentUseCase: any;

  const mockInput = {
    startDate: new Date(Date.now() + 86400000), // tomorrow
    endDate: new Date(Date.now() + 86400000),
    reason: 'Family event'
  };

  beforeEach(() => {
    mockLeaveRepo = {
      create: jest.fn().mockResolvedValue({ id: 'l-1' }),
    };
    mockAppointmentRepo = {
      getAppointmentsByDoctorId: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
    };
    mockSendNotificationUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    mockCancelAppointmentUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ApplyLeaveUseCase(
      mockLeaveRepo,
      mockAppointmentRepo,
      mockSendNotificationUseCase,
      mockCancelAppointmentUseCase
    );

    jest.clearAllMocks();
  });

  it('should successfully apply leave when no conflicts', async () => {
    const result = await useCase.execute('d-1', mockInput);
    expect(mockLeaveRepo.create).toHaveBeenCalled();
    expect(result.id).toBe('l-1');
  });

  it('should throw error if startDate > endDate', async () => {
    await expect(useCase.execute('d-1', { ...mockInput, endDate: new Date(Date.now()) }))
      .rejects.toThrow("Start date must be before or equal to end date");
  });

  it('should throw error if conflicts exist and not suppressed', async () => {
    mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue({ data: [{ id: 'a-1' }], meta: { total: 1 } });
    await expect(useCase.execute('d-1', mockInput))
      .rejects.toThrow("Appointment conflict");
  });

  it('should auto-cancel appointments if conflicts exist and suppressed', async () => {
    mockAppointmentRepo.getAppointmentsByDoctorId.mockResolvedValue({ 
      data: [{ id: 'a-1', patientId: 'p-1' }], 
      meta: { total: 1 } 
    });

    await useCase.execute('d-1', { ...mockInput, suppressConflicts: true });

    expect(mockCancelAppointmentUseCase.execute).toHaveBeenCalledWith(
      'a-1', 'p-1', 'Doctor on Leave', false, true
    );
    expect(mockLeaveRepo.create).toHaveBeenCalled();
  });
});
