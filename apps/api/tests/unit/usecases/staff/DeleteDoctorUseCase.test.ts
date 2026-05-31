import { DeleteDoctorUseCase } from "@/application/use-cases/staff/DeleteDoctorUseCase";
import { IStaffRepository } from "@/domain/repositories/IStaffRepository";

describe("DeleteDoctorUseCase", () => {
  let useCase: DeleteDoctorUseCase;
  let mockStaffRepo: jest.Mocked<IStaffRepository>;

  beforeEach(() => {
    mockStaffRepo = {
      deleteDoctor: jest.fn(),
    } as any;
    useCase = new DeleteDoctorUseCase(mockStaffRepo);
  });

  it("should successfully call repository deleteDoctor with provided ID (Happy Path)", async () => {
    // Arrange
    const doctorId = "doc_123";
    mockStaffRepo.deleteDoctor.mockResolvedValue(undefined);

    // Act
    await useCase.execute(doctorId);

    // Assert
    expect(mockStaffRepo.deleteDoctor).toHaveBeenCalledWith(doctorId);
    expect(mockStaffRepo.deleteDoctor).toHaveBeenCalledTimes(1);
  });

  it("should propagate repository errors if deletion fails (Exception Handling)", async () => {
    // Arrange
    const doctorId = "doc_123";
    mockStaffRepo.deleteDoctor.mockRejectedValue(new Error("Database error"));

    // Act & Assert
    await expect(useCase.execute(doctorId)).rejects.toThrow("Database error");
  });

  it("should handle invalid or empty ID by calling repo (repo handles validation usually)", async () => {
    // Arrange
    const doctorId = "";
    mockStaffRepo.deleteDoctor.mockResolvedValue(undefined);

    // Act
    await useCase.execute(doctorId);

    // Assert
    expect(mockStaffRepo.deleteDoctor).toHaveBeenCalledWith("");
  });
});
