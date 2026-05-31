"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CreateDoctorUseCase_1 = require("@/application/use-cases/staff/CreateDoctorUseCase");
describe("CreateDoctorUseCase", () => {
    let useCase;
    let mockStaffRepo;
    let mockEmailService;
    beforeEach(() => {
        mockStaffRepo = {
            createDoctor: jest.fn(),
        };
        mockEmailService = {
            sendDoctorCredentialsEmail: jest.fn(),
        };
        useCase = new CreateDoctorUseCase_1.CreateDoctorUseCase(mockStaffRepo, mockEmailService);
        jest.clearAllMocks();
    });
    it("should successfully create a doctor and send a credentials email (Happy Path)", async () => {
        // Arrange
        const input = {
            email: "doctor@medixflow.com",
            firstName: "John",
            lastName: "Doe",
            specialization: "Cardiology",
        };
        const mockResult = {
            user: { id: "doc_123", email: input.email, firstName: "John", lastName: "Doe" },
            setupToken: "setup_token_123",
        };
        mockStaffRepo.createDoctor.mockResolvedValue(mockResult);
        mockEmailService.sendDoctorCredentialsEmail.mockResolvedValue(undefined);
        // Act
        const result = await useCase.execute(input);
        // Assert
        expect(result.user).toEqual(mockResult.user);
        expect(result.setupToken).toBe(mockResult.setupToken);
        expect(result.temporaryPassword).toHaveLength(8); // hex(4) = 8 chars
        expect(mockStaffRepo.createDoctor).toHaveBeenCalledWith(input, result.temporaryPassword);
        expect(mockEmailService.sendDoctorCredentialsEmail).toHaveBeenCalledWith(input.email, input.firstName, result.temporaryPassword);
    });
    it("should complete successfully even if email sending fails (Resilience)", async () => {
        // Arrange
        const input = { email: "doc@test.com", firstName: "John" };
        mockStaffRepo.createDoctor.mockResolvedValue({ user: { id: "d1" }, setupToken: "tok" });
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
        await expect(useCase.execute({ email: "doc@test.com" })).rejects.toThrow("Database unique constraint violation");
        expect(mockEmailService.sendDoctorCredentialsEmail).not.toHaveBeenCalled();
    });
    it("should generate a random temporary password for each execution", async () => {
        // Arrange
        mockStaffRepo.createDoctor.mockResolvedValue({ user: {}, setupToken: "" });
        // Act
        const result1 = await useCase.execute({});
        const result2 = await useCase.execute({});
        // Assert
        expect(result1.temporaryPassword).not.toBe(result2.temporaryPassword);
    });
});
