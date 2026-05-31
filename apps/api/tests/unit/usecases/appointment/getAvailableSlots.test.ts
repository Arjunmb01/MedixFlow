import { GetAvailableSlotsUseCase } from "@/application/use-cases/appointment/getAvailableSlots.usecase";

describe('GetAvailableSlotsUseCase', () => {
    let useCase: GetAvailableSlotsUseCase;
    let mockAppointmentRepo: any;

    beforeEach(() => {
        mockAppointmentRepo = {
            getDoctorSchedule: jest.fn(),
            getAppointmentsByDoctorAndDate: jest.fn(),
        };
        useCase = new GetAvailableSlotsUseCase(mockAppointmentRepo);
        jest.clearAllMocks();
    });

    it('should return empty array if no schedule exists', async () => {
        mockAppointmentRepo.getDoctorSchedule.mockResolvedValue(null);
        const result = await useCase.execute('doc-1', new Date());
        expect(result).toEqual([]);
    });

    it('should generate slots and calculate availability correctly', async () => {
        // Arrange
        const doctorId = 'doc-1';
        const date = new Date('2025-12-25T00:00:00Z');
        mockAppointmentRepo.getDoctorSchedule.mockResolvedValue({
            startTime: '09:00',
            endTime: '11:00',
            slotCapacity: 2
        });
        mockAppointmentRepo.getAppointmentsByDoctorAndDate.mockResolvedValue([
            { slotStart: '09:00', status: 'BOOKED' },
            { slotStart: '09:00', status: 'BOOKED' },
            { slotStart: '10:00', status: 'BOOKED' },
        ]);

        // Act
        const result = await useCase.execute(doctorId, date);

        // Assert
        expect(result).toHaveLength(2); // 09:00-10:00, 10:00-11:00
        
        // First slot (09:00)
        expect(result[0].start).toBe('09:00');
        expect(result[0].booked).toBe(2);
        expect(result[0].isFull).toBe(true);
        expect(result[0].available).toBe(0);

        // Second slot (10:00)
        expect(result[1].start).toBe('10:00');
        expect(result[1].booked).toBe(1);
        expect(result[1].isFull).toBe(false);
        expect(result[1].available).toBe(1);
    });

    it('should mark slots as past if today and time has passed', async () => {
        // Arrange
        const now = new Date();
        now.setHours(10, 30, 0, 0);
        jest.useFakeTimers().setSystemTime(now);

        const doctorId = 'doc-1';
        const today = new Date(); // Using local date for comparison in the use case
        mockAppointmentRepo.getDoctorSchedule.mockResolvedValue({
            startTime: '09:00',
            endTime: '12:00',
            slotCapacity: 5
        });
        mockAppointmentRepo.getAppointmentsByDoctorAndDate.mockResolvedValue([]);

        // Act
        const result = await useCase.execute(doctorId, today);

        // Assert
        // Slot 09:00 should be past
        expect(result.find(s => s.start === '09:00')?.isPast).toBe(true);
        // Slot 11:00 should not be past
        expect(result.find(s => s.start === '11:00')?.isPast).toBe(false);

        jest.useRealTimers();
    });

    it('should ignore CANCELLED appointments for booking count', async () => {
        // Arrange
        mockAppointmentRepo.getDoctorSchedule.mockResolvedValue({
            startTime: '09:00',
            endTime: '10:00',
            slotCapacity: 2
        });
        mockAppointmentRepo.getAppointmentsByDoctorAndDate.mockResolvedValue([
            { slotStart: '09:00', status: 'CANCELLED' },
        ]);

        // Act
        const result = await useCase.execute('doc-1', new Date());

        // Assert
        expect(result[0].booked).toBe(0);
    });
});
