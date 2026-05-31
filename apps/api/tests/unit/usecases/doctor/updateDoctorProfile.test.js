"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updateDoctorProfile_usecase_1 = require("@/application/use-cases/doctor/updateDoctorProfile.usecase");
describe("UpdateDoctorProfileUseCase", () => {
    let useCase;
    let mockDoctorRepo;
    beforeEach(() => {
        mockDoctorRepo = {
            findById: jest.fn(),
            updateProfile: jest.fn(),
        };
        useCase = new updateDoctorProfile_usecase_1.UpdateDoctorProfileUseCase(mockDoctorRepo);
    });
    it("should successfully update doctor profile (Happy Path)", async () => {
        // Arrange
        const userId = "doc_123";
        const updateData = { specialization: "Neurology", bio: "Expert in brain health" };
        const mockUpdatedProfile = { ...updateData, id: "profile_1" };
        mockDoctorRepo.findById.mockResolvedValue({ id: userId });
        mockDoctorRepo.updateProfile.mockResolvedValue(mockUpdatedProfile);
        // Act
        const result = await useCase.execute(userId, updateData);
        // Assert
        expect(result).toEqual(mockUpdatedProfile);
        expect(mockDoctorRepo.updateProfile).toHaveBeenCalledWith(userId, updateData);
    });
    it("should propagate errors from the repository", async () => {
        // Arrange
        mockDoctorRepo.findById.mockResolvedValue({ id: "id" });
        mockDoctorRepo.updateProfile.mockRejectedValue(new Error("Update failed"));
        // Act & Assert
        await expect(useCase.execute("id", {})).rejects.toThrow("Update failed");
    });
    it("should work with partial updates", async () => {
        // Arrange
        const userId = "doc_123";
        const updateData = { bio: "Updated bio" };
        mockDoctorRepo.findById.mockResolvedValue({ id: userId });
        // Act
        await useCase.execute(userId, updateData);
        // Assert
        expect(mockDoctorRepo.updateProfile).toHaveBeenCalledWith(userId, updateData);
    });
    it("should throw error if doctor profile not found (unauthorized/invalid)", async () => {
        mockDoctorRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute("non_existent", {}))
            .rejects.toThrow("Doctor profile not found");
    });
});
