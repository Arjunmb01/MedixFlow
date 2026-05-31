"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updatePassword_usecase_1 = require("@/application/use-cases/patient/updatePassword.usecase");
const constants_1 = require("@/shared/constants");
describe("UpdatePasswordUseCase", () => {
    let useCase;
    let mockPatientRepository;
    let mockPasswordHasher;
    beforeEach(() => {
        mockPatientRepository = {
            findById: jest.fn(),
            updatePassword: jest.fn(),
        };
        mockPasswordHasher = {
            hash: jest.fn(),
            compare: jest.fn(),
        };
        useCase = new updatePassword_usecase_1.UpdatePasswordUseCase(mockPatientRepository, mockPasswordHasher);
    });
    it("should successfully update password", async () => {
        // Arrange
        const patientId = "patient_123";
        const currentPassword = "old_password";
        const newPassword = "new_secure_password";
        const patientHash = "hashed_old";
        const newHash = "hashed_new";
        mockPatientRepository.findById.mockResolvedValue({ id: patientId, passwordHash: patientHash });
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockPasswordHasher.hash.mockResolvedValue(newHash);
        mockPatientRepository.updatePassword.mockResolvedValue(undefined);
        // Act
        const result = await useCase.execute(patientId, { currentPassword, newPassword });
        // Assert
        expect(result.message).toBe(constants_1.MESSAGES.PASSWORD_RESET_SUCCESS);
        expect(mockPasswordHasher.compare).toHaveBeenCalledWith(currentPassword, patientHash);
        expect(mockPasswordHasher.hash).toHaveBeenCalledWith(newPassword);
        expect(mockPatientRepository.updatePassword).toHaveBeenCalledWith(patientId, newHash);
    });
    it("should throw error if current or new password is missing", async () => {
        // Act & Assert
        await expect(useCase.execute("id", { currentPassword: "pwd" })).rejects.toThrow("Current and new password are required");
        await expect(useCase.execute("id", { newPassword: "pwd" })).rejects.toThrow("Current and new password are required");
    });
    it("should throw error if new password is too short", async () => {
        // Act & Assert
        await expect(useCase.execute("id", { currentPassword: "pwd", newPassword: "short" })).rejects.toThrow(constants_1.MESSAGES.NEW_PASSWORD_LENGTH);
    });
    it("should throw error if patient is not found", async () => {
        // Arrange
        mockPatientRepository.findById.mockResolvedValue(null);
        // Act & Assert
        await expect(useCase.execute("id", { currentPassword: "pwd12345", newPassword: "pwd123456" })).rejects.toThrow(constants_1.MESSAGES.PATIENT_NOT_FOUND);
    });
    it("should throw error if patient has no password hash", async () => {
        // Arrange
        mockPatientRepository.findById.mockResolvedValue({ id: "id" });
        // Act & Assert
        await expect(useCase.execute("id", { currentPassword: "pwd12345", newPassword: "pwd123456" })).rejects.toThrow("Cannot verify current password: No hash found.");
    });
    it("should throw error if current password does not match", async () => {
        // Arrange
        mockPatientRepository.findById.mockResolvedValue({ id: "id", passwordHash: "hash" });
        mockPasswordHasher.compare.mockResolvedValue(false);
        // Act & Assert
        await expect(useCase.execute("id", { currentPassword: "wrong", newPassword: "pwd123456" })).rejects.toThrow(constants_1.MESSAGES.INVALID_CURRENT_PASSWORD);
    });
});
