import { GetDoctorDashboardStatsUseCase } from "@/application/use-cases/doctor/getDoctorDashboardStats.usecase";

describe('GetDoctorDashboardStatsUseCase', () => {
    let useCase: GetDoctorDashboardStatsUseCase;
    let mockDoctorRepo: any;
    let mockDateTimeService: any;

    beforeEach(() => {
        mockDoctorRepo = {
            getRawStats: jest.fn(),
        };
        mockDateTimeService = {
            now: jest.fn().mockReturnValue(new Date()),
        };
        useCase = new GetDoctorDashboardStatsUseCase(mockDoctorRepo, mockDateTimeService);
        jest.clearAllMocks();
    });

    it('should fetch raw stats and sort today appointments correctly', async () => {
        // Arrange
        const mockRaw = {
            totalAppointments: 10,
            completedAppointments: 5,
            pendingAppointments: 5,
            uniquePatientsCount: 8,
            todayAppointments: [
                { id: '1', slotStart: '10:00', consultation: { status: 'WAITING' }, patient: {} },
                { id: '2', slotStart: '09:00', consultation: { status: 'COMPLETED' }, patient: {} },
                { id: '3', slotStart: '09:30', consultation: { status: 'IN_PROGRESS' }, patient: {} },
            ],
            totalEarnings: 5000,
            dashboardDate: new Date()
        };
        mockDoctorRepo.getRawStats.mockResolvedValue(mockRaw);

        // Act
        const result = await useCase.execute('u-1');

        // Assert
        // Expected order by status priority: IN_PROGRESS (3) > WAITING (2) > COMPLETED (1)
        expect(result.todayAppointments[0].id).toBe('3');
        expect(result.todayAppointments[1].id).toBe('1');
        expect(result.todayAppointments[2].id).toBe('2');
        expect(result.totalPatients).toBe(8);
    });
});
