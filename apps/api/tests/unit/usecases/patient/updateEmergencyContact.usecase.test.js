"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmergencyContact_usecase_1 = require("@/application/use-cases/patient/updateEmergencyContact.usecase");
const constants_1 = require("@/shared/constants");
describe("UpdateEmergencyContactUseCase", () => {
    let useCase;
    let mockPatientRepository;
    beforeEach(() => {
        mockPatientRepository = {
            findById: jest.fn(),
            replaceEmergencyContacts: jest.fn(),
        };
        useCase = new updateEmergencyContact_usecase_1.UpdateEmergencyContactUseCase(mockPatientRepository);
    });
    it("should successfully update emergency contacts", async () => {
        // Arrange
        const patientId = "patient_123";
        const contacts = [{ name: "Jane Doe", mobile: "1234567890", relation: "Sister" }];
        mockPatientRepository.findById.mockResolvedValue({ id: patientId });
        mockPatientRepository.replaceEmergencyContacts.mockResolvedValue(undefined);
        // Act
        const result = await useCase.execute(patientId, contacts);
        // Assert
        expect(result.message).toBe(constants_1.MESSAGES.EMERGENCY_CONTACT_UPDATED);
        expect(mockPatientRepository.replaceEmergencyContacts).toHaveBeenCalledWith(patientId, contacts);
    });
    it("should throw error if patient is not found", async () => {
        // Arrange
        mockPatientRepository.findById.mockResolvedValue(null);
        // Act & Assert
        await expect(useCase.execute("non_existent", [])).rejects.toThrow(constants_1.MESSAGES.PATIENT_NOT_FOUND);
    });
    it("should handle empty contacts list", async () => {
        // Arrange
        const patientId = "patient_123";
        mockPatientRepository.findById.mockResolvedValue({ id: patientId });
        // Act
        await useCase.execute(patientId, []);
        // Assert
        expect(mockPatientRepository.replaceEmergencyContacts).toHaveBeenCalledWith(patientId, []);
    });
    it("should propagate repository errors", async () => {
        // Arrange
        mockPatientRepository.findById.mockResolvedValue({ id: "id" });
        mockPatientRepository.replaceEmergencyContacts.mockRejectedValue(new Error("Database error"));
        // Act & Assert
        await expect(useCase.execute("id", [])).rejects.toThrow("Database error");
    });
});
