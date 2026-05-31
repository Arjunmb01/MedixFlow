import { UpdateDoctorProfileUseCase } from "@/application/use-cases/doctor/updateDoctorProfile.usecase";
import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";

describe("UpdateDoctorProfileUseCase", () => {
  let useCase: UpdateDoctorProfileUseCase;
  let mockDoctorRepo: jest.Mocked<IDoctorProfileRepository>;

  beforeEach(() => {
    mockDoctorRepo = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
    } as any;
    useCase = new UpdateDoctorProfileUseCase(mockDoctorRepo);
  });

  it("should successfully update doctor profile (Happy Path)", async () => {
    // Arrange
    const userId = "doc_123";
    const updateData = { specialization: "Neurology", bio: "Expert in brain health" } as any;
    const mockUpdatedProfile = { ...updateData, id: "profile_1" };
    
    mockDoctorRepo.findById.mockResolvedValue({ id: userId } as any);
    mockDoctorRepo.updateProfile.mockResolvedValue(mockUpdatedProfile);

    // Act
    const result = await useCase.execute(userId, updateData);

    // Assert
    expect(result).toEqual(mockUpdatedProfile);
    expect(mockDoctorRepo.updateProfile).toHaveBeenCalledWith(userId, updateData);
  });

  it("should propagate errors from the repository", async () => {
    // Arrange
    mockDoctorRepo.findById.mockResolvedValue({ id: "id" } as any);
    mockDoctorRepo.updateProfile.mockRejectedValue(new Error("Update failed"));

    // Act & Assert
    await expect(useCase.execute("id", {})).rejects.toThrow("Update failed");
  });

  it("should work with partial updates", async () => {
    // Arrange
    const userId = "doc_123";
    const updateData = { bio: "Updated bio" };
    mockDoctorRepo.findById.mockResolvedValue({ id: userId } as any);
    
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
