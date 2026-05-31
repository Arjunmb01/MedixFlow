import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { AppError } from "@/shared/errors/AppError";

describe("ConsultationAccessPolicy", () => {
  const appointmentRepo = {
    findById: jest.fn(),
  };
  const sessionRepo = {
    findById: jest.fn(),
    findByRoomId: jest.fn(),
  };
  const dateTimeService = {
    isWithinVideoConsultationWindow: jest.fn().mockReturnValue(true),
  };

  const policy = new ConsultationAccessPolicy(
    appointmentRepo as never,
    sessionRepo as never,
    dateTimeService as never
  );

  beforeEach(() => jest.clearAllMocks());

  it("rejects non-video appointments", async () => {
    appointmentRepo.findById.mockResolvedValue({
      id: "a1",
      patientId: "p1",
      doctorId: "d1",
      status: "BOOKED",
      consultationType: "CLINIC",
      appointmentDate: new Date(),
      slotStart: "10:00",
      slotEnd: "11:00",
    });

    await expect(
      policy.assertVideoAppointment("a1", "p1", UserRole.PATIENT)
    ).rejects.toBeInstanceOf(AppError);
  });

  it("rejects unauthorized patient", async () => {
    appointmentRepo.findById.mockResolvedValue({
      id: "a1",
      patientId: "p1",
      doctorId: "d1",
      status: "BOOKED",
      consultationType: "VIDEO",
      appointmentDate: new Date(),
      slotStart: "10:00",
      slotEnd: "11:00",
    });

    await expect(
      policy.assertVideoAppointment("a1", "other", UserRole.PATIENT)
    ).rejects.toBeInstanceOf(AppError);
  });

  it("allows video appointment for owner", async () => {
    const appt = {
      id: "a1",
      patientId: "p1",
      doctorId: "d1",
      status: "BOOKED",
      consultationType: "VIDEO",
      appointmentDate: new Date(),
      slotStart: "10:00",
      slotEnd: "11:00",
    };
    appointmentRepo.findById.mockResolvedValue(appt);

    const result = await policy.assertVideoAppointment("a1", "p1", UserRole.PATIENT);
    expect(result.id).toBe("a1");
  });
});
