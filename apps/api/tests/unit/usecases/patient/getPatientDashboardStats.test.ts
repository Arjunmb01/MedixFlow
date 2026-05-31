import { GetPatientDashboardStatsUseCase } from "@/application/use-cases/patient/getPatientDashboardStats.usecase";

describe("GetPatientDashboardStatsUseCase", () => {
  let useCase: GetPatientDashboardStatsUseCase;
  let mockAppointmentRepo: {
    getPatientDashboardSummary: jest.Mock;
  };
  let mockPatientRepo: { findById: jest.Mock };
  let mockCalculateCompletion: { execute: jest.Mock };

  beforeEach(() => {
    mockAppointmentRepo = {
      getPatientDashboardSummary: jest.fn(),
    };
    mockPatientRepo = {
      findById: jest.fn().mockResolvedValue({ id: "p-1" }),
    };
    mockCalculateCompletion = {
      execute: jest.fn().mockReturnValue(85),
    };
    useCase = new GetPatientDashboardStatsUseCase(
      mockAppointmentRepo as never,
      mockPatientRepo as never,
      mockCalculateCompletion as never
    );
  });

  it("should fetch dashboard summary and patient profile", async () => {
    mockAppointmentRepo.getPatientDashboardSummary.mockResolvedValue({
      upcomingCount: 1,
      nextAppointment: {
        id: "a-1",
        date: new Date(),
        slotStart: "10:00",
        doctorName: "Dr. D Doc",
        specialty: "Cardiology",
      },
      recentAppointments: [],
    });

    const result = await useCase.execute("u-1");

    expect(mockAppointmentRepo.getPatientDashboardSummary).toHaveBeenCalledWith("u-1");
    expect(result.profileCompletion).toBe(85);
    expect(result.upcomingAppointmentsCount).toBe(1);
    expect(result.nextAppointment?.doctorName).toBe("Dr. D Doc");
    expect(result.nextAppointment?.specialty).toBe("Cardiology");
  });

  it("should handle empty summary", async () => {
    mockAppointmentRepo.getPatientDashboardSummary.mockResolvedValue({
      upcomingCount: 0,
      nextAppointment: null,
      recentAppointments: [],
    });

    const result = await useCase.execute("u-1");
    expect(result.upcomingAppointmentsCount).toBe(0);
    expect(result.nextAppointment).toBeNull();
    expect(result.recentAppointments).toHaveLength(0);
  });
});
