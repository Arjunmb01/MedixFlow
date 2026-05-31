"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAllPatients_usecase_1 = require("@/application/use-cases/patient/getAllPatients.usecase");
describe("GetAllPatientsUseCase", () => {
    let useCase;
    let mockPatientRepository;
    beforeEach(() => {
        mockPatientRepository = {
            getPatients: jest.fn(),
        };
        useCase = new getAllPatients_usecase_1.GetAllPatientsUseCase(mockPatientRepository);
    });
    it("should return paginated patients based on filters", async () => {
        // Arrange
        const filters = {
            page: 1,
            limit: 10,
            search: "John",
        };
        const mockResponse = {
            data: [
                { id: "1", name: "John Doe", email: "john@example.com" },
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
        const filters = { page: 1, limit: 10 };
        const mockResponse = {
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
