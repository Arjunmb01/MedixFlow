import { UpdateEmergencyContactUseCase } from "@/application/use-cases/patient/updateEmergencyContact.usecase";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { MESSAGES } from "@/shared/constants";

describe("UpdateEmergencyContactUseCase", () => {
  let useCase: UpdateEmergencyContactUseCase;
  let mockPatientRepository: jest.Mocked<IPatientRepository>;

  beforeEach(() => {
    mockPatientRepository = {
      findById: jest.fn(),
      replaceEmergencyContacts: jest.fn(),
    } as any;

    useCase = new UpdateEmergencyContactUseCase(mockPatientRepository);
  });

  it("should successfully update emergency contacts", async () => {
    // Arrange
    const patientId = "patient_123";
    const contacts = [{ name: "Jane Doe", mobile: "1234567890", relation: "Sister" }];
    
    mockPatientRepository.findById.mockResolvedValue({ id: patientId } as any);
    mockPatientRepository.replaceEmergencyContacts.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(patientId, contacts);

    // Assert
    expect(result.message).toBe(MESSAGES.EMERGENCY_CONTACT_UPDATED);
    expect(mockPatientRepository.replaceEmergencyContacts).toHaveBeenCalledWith(patientId, contacts);
  });

  it("should throw error if patient is not found", async () => {
    // Arrange
    mockPatientRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("non_existent", [])).rejects.toThrow(MESSAGES.PATIENT_NOT_FOUND);
  });

  it("should handle empty contacts list", async () => {
    // Arrange
    const patientId = "patient_123";
    mockPatientRepository.findById.mockResolvedValue({ id: patientId } as any);

    // Act
    await useCase.execute(patientId, []);

    // Assert
    expect(mockPatientRepository.replaceEmergencyContacts).toHaveBeenCalledWith(patientId, []);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    mockPatientRepository.findById.mockResolvedValue({ id: "id" } as any);
    mockPatientRepository.replaceEmergencyContacts.mockRejectedValue(new Error("Database error"));

    // Act & Assert
    await expect(useCase.execute("id", [])).rejects.toThrow("Database error");
  });
});
