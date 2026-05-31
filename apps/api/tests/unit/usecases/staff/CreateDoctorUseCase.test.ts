import { CreateDoctorUseCase } from "@/application/use-cases/staff/CreateDoctorUseCase";
import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { IEmailService } from "@/application/interfaces/IEmailService";

describe("CreateDoctorUseCase", () => {
  let useCase: CreateDoctorUseCase;
  let mockStaffRepo: jest.Mocked<IStaffRepository>;
  let mockEmailService: jest.Mocked<IEmailService>;

  beforeEach(() => {
    mockStaffRepo = {
      createDoctor: jest.fn(),
    } as any;
    
    mockEmailService = {
      sendDoctorCredentialsEmail: jest.fn(),
    } as any;

    useCase = new CreateDoctorUseCase(mockStaffRepo, mockEmailService);
    jest.clearAllMocks();
  });

  it("should successfully create a doctor and send a credentials email (Happy Path)", async () => {
    // Arrange
    const input = {
      email: "doctor@medixflow.com",
      firstName: "John",
      lastName: "Doe",
      specialization: "Cardiology",
    } as any;

    const mockResult = {
      user: { id: "doc_123", email: input.email, firstName: "John", lastName: "Doe" },
      setupToken: "setup_token_123",
    };

    mockStaffRepo.createDoctor.mockResolvedValue(mockResult as any);
    mockEmailService.sendDoctorCredentialsEmail.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.user).toEqual(mockResult.user);
    expect(result.setupToken).toBe(mockResult.setupToken);
    expect(result.temporaryPassword).toHaveLength(8); // hex(4) = 8 chars
    expect(mockStaffRepo.createDoctor).toHaveBeenCalledWith(input, result.temporaryPassword);
    expect(mockEmailService.sendDoctorCredentialsEmail).toHaveBeenCalledWith(
      input.email,
      input.firstName,
      result.temporaryPassword
    );
  });

  it("should complete successfully even if email sending fails (Resilience)", async () => {
    // Arrange
    const input = { email: "doc@test.com", firstName: "John" } as any;
    mockStaffRepo.createDoctor.mockResolvedValue({ user: { id: "d1" }, setupToken: "tok" } as any);
    mockEmailService.sendDoctorCredentialsEmail.mockRejectedValue(new Error("Email service down"));

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.user.id).toBe("d1");
    expect(mockEmailService.sendDoctorCredentialsEmail).toHaveBeenCalled();
    // UseCase should not throw if email fails as per try-catch in source
  });

  it("should propagate errors from the repository", async () => {
    // Arrange
    mockStaffRepo.createDoctor.mockRejectedValue(new Error("Database unique constraint violation"));

    // Act & Assert
    await expect(useCase.execute({ email: "doc@test.com" } as any)).rejects.toThrow("Database unique constraint violation");
    expect(mockEmailService.sendDoctorCredentialsEmail).not.toHaveBeenCalled();
  });

  it("should generate a random temporary password for each execution", async () => {
    // Arrange
    mockStaffRepo.createDoctor.mockResolvedValue({ user: {}, setupToken: "" } as any);
    
    // Act
    const result1 = await useCase.execute({} as any);
    const result2 = await useCase.execute({} as any);

    // Assert
    expect(result1.temporaryPassword).not.toBe(result2.temporaryPassword);
  });
});
