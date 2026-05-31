import { GetAllPatientsUseCase } from "@/application/use-cases/patient/getAllPatients.usecase";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { PatientFilters, PaginatedPatients } from "@/domain/value-objects/types/patient.repository.types";

describe("GetAllPatientsUseCase", () => {
  let useCase: GetAllPatientsUseCase;
  let mockPatientRepository: jest.Mocked<IPatientRepository>;

  beforeEach(() => {
    mockPatientRepository = {
      getPatients: jest.fn(),
    } as any;

    useCase = new GetAllPatientsUseCase(mockPatientRepository);
  });

  it("should return paginated patients based on filters", async () => {
    // Arrange
    const filters: PatientFilters = {
      page: 1,
      limit: 10,
      search: "John",
    };

    const mockResponse: PaginatedPatients = {
      data: [
        { id: "1", name: "John Doe", email: "john@example.com" } as any,
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    mockPatientRepository.getPatients.mockResolvedValue(mockResponse);

    // Act
    const result = await useCase.execute(filters);

    // Assert
    expect(result).toEqual(mockResponse);
    expect(mockPatientRepository.getPatients).toHaveBeenCalledWith(filters);
  });

  it("should handle empty results", async () => {
    // Arrange
    const filters: PatientFilters = { page: 1, limit: 10 };
    const mockResponse: PaginatedPatients = {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };

    mockPatientRepository.getPatients.mockResolvedValue(mockResponse);

    // Act
    const result = await useCase.execute(filters);

    // Assert
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    mockPatientRepository.getPatients.mockRejectedValue(new Error("Database error"));

    // Act & Assert
    await expect(useCase.execute({})).rejects.toThrow("Database error");
  });
});
