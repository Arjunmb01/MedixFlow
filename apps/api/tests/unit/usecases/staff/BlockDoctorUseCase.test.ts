import { BlockDoctorUseCase, BlockDoctorUseCaseInput } from "@/application/use-cases/staff/BlockDoctorUseCase";
import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";

describe("BlockDoctorUseCase", () => {
  let useCase: BlockDoctorUseCase;
  let mockStaffRepo: jest.Mocked<IStaffRepository>;
  let mockSessionService: jest.Mocked<ISessionService>;

  beforeEach(() => {
    mockStaffRepo = {
      blockDoctor: jest.fn(),
    } as any;
    mockSessionService = {
      deleteSession: jest.fn(),
    } as any;

    useCase = new BlockDoctorUseCase(mockStaffRepo, mockSessionService);
  });

  it("should update doctor status and delete session if suspended (Happy Path - SUSPENDED)", async () => {
    // Arrange
    const input: BlockDoctorUseCaseInput = {
      id: "doc_123",
      status: UserStatus.SUSPENDED,
    };
    mockStaffRepo.blockDoctor.mockResolvedValue(undefined);
    mockSessionService.deleteSession.mockResolvedValue(undefined);

    // Act
    await useCase.execute(input);

    // Assert
    expect(mockStaffRepo.blockDoctor).toHaveBeenCalledWith("doc_123", UserStatus.SUSPENDED);
    expect(mockSessionService.deleteSession).toHaveBeenCalledWith("doc_123");
  });

  it("should update doctor status and delete session if inactive (Happy Path - INACTIVE)", async () => {
    // Arrange
    const input: BlockDoctorUseCaseInput = {
      id: "doc_123",
      status: UserStatus.INACTIVE,
    };

    // Act
    await useCase.execute(input);

    // Assert
    expect(mockSessionService.deleteSession).toHaveBeenCalledWith("doc_123");
  });

  it("should NOT delete session if status is ACTIVE (Business Rule)", async () => {
    // Arrange
    const input: BlockDoctorUseCaseInput = {
      id: "doc_123",
      status: UserStatus.ACTIVE,
    };

    // Act
    await useCase.execute(input);

    // Assert
    expect(mockStaffRepo.blockDoctor).toHaveBeenCalledWith("doc_123", UserStatus.ACTIVE);
    expect(mockSessionService.deleteSession).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    mockStaffRepo.blockDoctor.mockRejectedValue(new Error("Database error"));

    // Act & Assert
    await expect(useCase.execute({ id: "id", status: UserStatus.SUSPENDED })).rejects.toThrow("Database error");
    expect(mockSessionService.deleteSession).not.toHaveBeenCalled();
  });

  it("should handle session deletion failure gracefully or propagate it?", async () => {
    // As per source code, it will propagate the error if sessionService fails
    mockStaffRepo.blockDoctor.mockResolvedValue(undefined);
    mockSessionService.deleteSession.mockRejectedValue(new Error("Redis error"));

    await expect(useCase.execute({ id: "id", status: UserStatus.SUSPENDED })).rejects.toThrow("Redis error");
  });
});
