import { GetPatientByIdUseCase } from "@/application/use-cases/patient/getPatientById.usecase";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { MESSAGES } from "@/shared/constants";

describe("GetPatientByIdUseCase", () => {
  let useCase: GetPatientByIdUseCase;
  let mockPatientRepository: jest.Mocked<IPatientRepository>;

  beforeEach(() => {
    mockPatientRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetPatientByIdUseCase(mockPatientRepository);
  });

  it("should return a patient if found", async () => {
    // Arrange
    const patientId = "patient_123";
    const mockPatient = { id: patientId, name: "John Doe" } as any;
    mockPatientRepository.findById.mockResolvedValue(mockPatient);

    // Act
    const result = await useCase.execute(patientId);

    // Assert
    expect(result).toEqual(mockPatient);
    expect(mockPatientRepository.findById).toHaveBeenCalledWith(patientId);
  });

  it("should throw error if patient is not found", async () => {
    // Arrange
    const patientId = "non_existent";
    mockPatientRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(patientId)).rejects.toThrow(MESSAGES.PATIENT_NOT_FOUND);
  });

  it("should handle invalid id (empty string)", async () => {
    // Arrange
    mockPatientRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("")).rejects.toThrow(MESSAGES.PATIENT_NOT_FOUND);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    mockPatientRepository.findById.mockRejectedValue(new Error("Database error"));

    // Act & Assert
    await expect(useCase.execute("id")).rejects.toThrow("Database error");
  });
});
