"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adminActions_usecase_1 = require("@/application/use-cases/admin/adminActions.usecase");
const UserStatus_1 = require("@/domain/value-objects/enums/UserStatus");
const constants_1 = require("@/shared/constants");
describe('AdminActions UseCases', () => {
    const mockPatientRepository = {
        toggleBlock: jest.fn(),
        deletePatient: jest.fn(),
        getStats: jest.fn(),
    };
    const mockStaffRepository = {
        getDoctorCount: jest.fn(),
    };
    const mockSessionService = {
        deleteSession: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('ToggleBlockPatientUseCase', () => {
        let useCase;
        beforeEach(() => {
            useCase = new adminActions_usecase_1.ToggleBlockPatientUseCase(mockPatientRepository, mockSessionService);
        });
        it('should toggle block status and return result', async () => {
            // Arrange
            const id = 'patient-123';
            const status = UserStatus_1.UserStatus.ACTIVE;
            mockPatientRepository.toggleBlock.mockResolvedValue({ id, status });
            // Act
            const result = await useCase.execute(id, status);
            // Assert
            expect(mockPatientRepository.toggleBlock).toHaveBeenCalledWith(id, status);
            expect(result).toEqual({ id, status });
            expect(mockSessionService.deleteSession).not.toHaveBeenCalled();
        });
        it('should delete session if status is SUSPENDED', async () => {
            // Arrange
            const id = 'patient-123';
            const status = UserStatus_1.UserStatus.SUSPENDED;
            mockPatientRepository.toggleBlock.mockResolvedValue({ id, status });
            // Act
            await useCase.execute(id, status);
            // Assert
            expect(mockSessionService.deleteSession).toHaveBeenCalledWith(id);
        });
        it('should delete session if status is INACTIVE', async () => {
            // Arrange
            const id = 'patient-123';
            const status = UserStatus_1.UserStatus.INACTIVE;
            mockPatientRepository.toggleBlock.mockResolvedValue({ id, status });
            // Act
            await useCase.execute(id, status);
            // Assert
            expect(mockSessionService.deleteSession).toHaveBeenCalledWith(id);
        });
    });
    describe('DeletePatientUseCase', () => {
        let useCase;
        beforeEach(() => {
            useCase = new adminActions_usecase_1.DeletePatientUseCase(mockPatientRepository);
        });
        it('should delete patient and return success message', async () => {
            // Arrange
            const id = 'patient-123';
            mockPatientRepository.deletePatient.mockResolvedValue(undefined);
            // Act
            const result = await useCase.execute(id);
            // Assert
            expect(mockPatientRepository.deletePatient).toHaveBeenCalledWith(id);
            expect(result).toEqual({ message: constants_1.MESSAGES.PATIENT_DELETED });
        });
    });
    describe('GetPatientStatsUseCase', () => {
        let useCase;
        beforeEach(() => {
            useCase = new adminActions_usecase_1.GetPatientStatsUseCase(mockPatientRepository, mockStaffRepository);
        });
        it('should return combined patient and doctor stats', async () => {
            // Arrange
            mockPatientRepository.getStats.mockResolvedValue({ total: 100 });
            mockStaffRepository.getDoctorCount.mockResolvedValue(10);
            // Act
            const result = await useCase.execute();
            // Assert
            expect(mockPatientRepository.getStats).toHaveBeenCalled();
            expect(mockStaffRepository.getDoctorCount).toHaveBeenCalled();
            expect(result).toEqual({
                patientCount: 100,
                doctorCount: 10
            });
        });
    });
});
