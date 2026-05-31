import { GetPatientAppointmentsUseCase } from "@/application/use-cases/patient/getPatientAppointments.usecase";
import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";

describe("GetPatientAppointmentsUseCase", () => {
  let useCase: GetPatientAppointmentsUseCase;
  let mockAppointmentRepo: jest.Mocked<IAppointmentRepository>;

  beforeEach(() => {
    mockAppointmentRepo = {
      getAppointmentsByPatientId: jest.fn(),
    } as unknown as jest.Mocked<IAppointmentRepository>;

    useCase = new GetPatientAppointmentsUseCase(mockAppointmentRepo);
  });

  it("should return appointments with consultation details by default", async () => {
    const patientId = "patient_123";
    const filter = { page: 1, limit: 10 };
    const mockAppointments = [{ id: "apt-1" }];

    mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({
      data: mockAppointments,
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    } as never);

    const result = await useCase.execute(patientId, filter);

    expect(result.data).toEqual(mockAppointments);
    expect(mockAppointmentRepo.getAppointmentsByPatientId).toHaveBeenCalledWith(patientId, {
      ...filter,
      includeConsultationDetails: true,
    });
  });

  it("should work without filter", async () => {
    const patientId = "patient_123";

    mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
    } as never);

    await useCase.execute(patientId);

    expect(mockAppointmentRepo.getAppointmentsByPatientId).toHaveBeenCalledWith(patientId, {
      includeConsultationDetails: true,
    });
  });

  it("should handle invalid patient ID (repo returns null/empty)", async () => {
    mockAppointmentRepo.getAppointmentsByPatientId.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
    } as never);

    const result = await useCase.execute("invalid-id");
    expect(result.data).toEqual([]);
  });

  it("should propagate repository errors", async () => {
    mockAppointmentRepo.getAppointmentsByPatientId.mockRejectedValue(new Error("Database error"));

    await expect(useCase.execute("patient_123")).rejects.toThrow("Database error");
  });
});
