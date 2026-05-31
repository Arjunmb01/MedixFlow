import { ToggleBlockPatientUseCase, DeletePatientUseCase, GetPatientStatsUseCase } from "@/application/use-cases/admin/adminActions.usecase";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";
import { MESSAGES } from "@/shared/constants";

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
    let useCase: ToggleBlockPatientUseCase;

    beforeEach(() => {
      useCase = new ToggleBlockPatientUseCase(
        mockPatientRepository as any,
        mockSessionService as any
      );
    });

    it('should toggle block status and return result', async () => {
      // Arrange
      const id = 'patient-123';
      const status = UserStatus.ACTIVE;
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
      const status = UserStatus.SUSPENDED;
      mockPatientRepository.toggleBlock.mockResolvedValue({ id, status });

      // Act
      await useCase.execute(id, status);

      // Assert
      expect(mockSessionService.deleteSession).toHaveBeenCalledWith(id);
    });

    it('should delete session if status is INACTIVE', async () => {
      // Arrange
      const id = 'patient-123';
      const status = UserStatus.INACTIVE;
      mockPatientRepository.toggleBlock.mockResolvedValue({ id, status });

      // Act
      await useCase.execute(id, status);

      // Assert
      expect(mockSessionService.deleteSession).toHaveBeenCalledWith(id);
    });
  });

  describe('DeletePatientUseCase', () => {
    let useCase: DeletePatientUseCase;

    beforeEach(() => {
      useCase = new DeletePatientUseCase(mockPatientRepository as any);
    });

    it('should delete patient and return success message', async () => {
      // Arrange
      const id = 'patient-123';
      mockPatientRepository.deletePatient.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(id);

      // Assert
      expect(mockPatientRepository.deletePatient).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: MESSAGES.PATIENT_DELETED });
    });
  });

  describe('GetPatientStatsUseCase', () => {
    let useCase: GetPatientStatsUseCase;

    beforeEach(() => {
      useCase = new GetPatientStatsUseCase(
        mockPatientRepository as any,
        mockStaffRepository as any
      );
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
