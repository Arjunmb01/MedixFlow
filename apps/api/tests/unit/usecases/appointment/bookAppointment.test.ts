import { BookAppointmentUseCase } from "@/application/use-cases/appointment/bookAppointment.usecase";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";
import { PaymentMethod } from "@/domain/value-objects/enums/PaymentMethod";
import { PaymentStatus } from "@/domain/value-objects/enums/PaymentStatus";
import { TransactionType } from "@/domain/value-objects/enums/TransactionType";
import { AppError } from "@/shared/errors/AppError";
import { StatusCode } from "@/shared/constants/statusCodes";
import { PaymentGatewayFactory } from "@/infrastructure/services/PaymentGatewayFactory";

jest.mock("@/infrastructure/services/PaymentGatewayFactory");

describe('BookAppointmentUseCase', () => {
    let useCase: BookAppointmentUseCase;
    let mockAppointmentRepo: any;
    let mockSchedulingPolicy: any;
    let mockDateTimeService: any;
    let mockSendNotificationUseCase: any;
    let mockPaymentRepo: any;
    let mockWalletRepo: any;
    let mockRazorpayService: any;
    let mockDoctorRepo: any;
    let mockPatientRepo: any;
    let mockQueueService: any;
    let mockSocketService: any;

    const mockData = {
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        appointmentDate: new Date(Date.now() + 86400000), // tomorrow
        slotStart: '10:00',
        slotEnd: '10:30',
        paymentMethod: PaymentMethod.STRIPE,
        useWallet: false
    };

    beforeEach(() => {
        mockAppointmentRepo = {
            getDoctorSchedule: jest.fn(),
            countActiveBookings: jest.fn(),
            findActiveBookingByPatient: jest.fn(),
            createWithTransaction: jest.fn(),
            updateStatus: jest.fn(),
            updateQueuePosition: jest.fn(),
            getTodaysQueue: jest.fn(),
        };
        mockSchedulingPolicy = {
            calculateSlotCapacity: jest.fn(),
        };
        mockDateTimeService = {
            now: jest.fn().mockReturnValue(new Date()),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        mockPaymentRepo = {
            create: jest.fn(),
        };
        mockWalletRepo = {
            findByPatientId: jest.fn(),
            updateBalance: jest.fn(),
        };
        mockRazorpayService = {
            createOrder: jest.fn(),
        };
        mockDoctorRepo = {
            findProfileById: jest.fn(),
        };
        mockPatientRepo = {
            findById: jest.fn(),
        };
        mockQueueService = {
            addToQueue: jest.fn(),
        };
        mockSocketService = {
            emitAppointmentBooked: jest.fn(),
            emitQueueUpdated: jest.fn(),
        };

        useCase = new BookAppointmentUseCase(
            mockAppointmentRepo,
            mockSchedulingPolicy,
            mockDateTimeService,
            mockSendNotificationUseCase,
            mockPaymentRepo,
            mockWalletRepo,
            mockRazorpayService,
            mockDoctorRepo,
            mockPatientRepo,
            mockQueueService,
            mockSocketService
        );

        jest.clearAllMocks();
    });

    describe('Validation', () => {
        it('should throw error if patientId or doctorId is missing', async () => {
            await expect(useCase.execute({ ...mockData, patientId: '' } as any))
                .rejects.toThrow(new AppError("Invalid patient or doctor", StatusCode.BAD_REQUEST));
        });

        it('should throw error if appointmentDate is missing', async () => {
            await expect(useCase.execute({ ...mockData, appointmentDate: undefined } as any))
                .rejects.toThrow(new AppError("Invalid date", StatusCode.BAD_REQUEST));
        });

        it('should throw error if slot is invalid', async () => {
            await expect(useCase.execute({ ...mockData, slotStart: '' } as any))
                .rejects.toThrow(new AppError("Invalid slot", StatusCode.BAD_REQUEST));
        });

        it('should throw error if booking in the past', async () => {
            const pastDate = new Date(Date.now() - 86400000);
            await expect(useCase.execute({ ...mockData, appointmentDate: pastDate }))
                .rejects.toThrow(new AppError("Cannot book an appointment in the past", StatusCode.BAD_REQUEST));
        });
    });

    describe('Business Rules', () => {
        it('should throw error if doctor not found', async () => {
            mockDoctorRepo.findProfileById.mockResolvedValue(null);
            await expect(useCase.execute(mockData))
                .rejects.toThrow(new AppError("Doctor not found", StatusCode.NOT_FOUND));
        });

        it('should throw error if slot is full', async () => {
            mockDoctorRepo.findProfileById.mockResolvedValue({ id: 'doctor-1', consultationFee: 500 });
            mockAppointmentRepo.getDoctorSchedule.mockResolvedValue({ slotCapacity: 5 });
            mockAppointmentRepo.countActiveBookings.mockResolvedValue(5);

            await expect(useCase.execute(mockData))
                .rejects.toThrow(new AppError("Slot is full (capacity: 5 patients)", StatusCode.BAD_REQUEST));
        });

        it('should throw error if patient already has an appointment at this time', async () => {
            mockDoctorRepo.findProfileById.mockResolvedValue({ id: 'doctor-1', consultationFee: 500 });
            mockAppointmentRepo.getDoctorSchedule.mockResolvedValue({ slotCapacity: 5 });
            mockAppointmentRepo.countActiveBookings.mockResolvedValue(0);
            mockAppointmentRepo.findActiveBookingByPatient.mockResolvedValue({ slotStart: '10:00' });

            await expect(useCase.execute(mockData))
                .rejects.toThrow(new AppError("You already have an active appointment at this time.", StatusCode.BAD_REQUEST));
        });
    });

    describe('Payment Flows', () => {
        beforeEach(() => {
            mockDoctorRepo.findProfileById.mockResolvedValue({ id: 'doctor-1', consultationFee: 500 });
            mockAppointmentRepo.getDoctorSchedule.mockResolvedValue({ slotCapacity: 5 });
            mockAppointmentRepo.countActiveBookings.mockResolvedValue(0);
            mockAppointmentRepo.findActiveBookingByPatient.mockResolvedValue(null);
            mockAppointmentRepo.createWithTransaction.mockResolvedValue({ id: 'apt-1', ...mockData });
        });

        it('should handle full wallet payment successfully', async () => {
            mockWalletRepo.findByPatientId.mockResolvedValue({ id: 'wallet-1', balance: 1000 });
            mockQueueService.addToQueue.mockResolvedValue(1);
            mockAppointmentRepo.getTodaysQueue.mockResolvedValue([]);

            const result = await useCase.execute({ ...mockData, useWallet: true });

            expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith('wallet-1', -500, TransactionType.PAYMENT, expect.any(String));
            expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith('apt-1', AppointmentStatus.BOOKED);
            expect(mockPaymentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                paymentMethod: PaymentMethod.WALLET,
                status: PaymentStatus.PAID
            }));
            expect(result.id).toBe('apt-1');
        });

        it('should handle Stripe payment session creation', async () => {
            const mockSession = { id: 'sess-1', url: 'https://stripe.com/pay' };
            (PaymentGatewayFactory.getGateway as jest.Mock).mockReturnValue({
                createSession: jest.fn().mockResolvedValue(mockSession)
            });
            mockPatientRepo.findById.mockResolvedValue({ email: 'patient@test.com' });

            const result = await useCase.execute({ ...mockData, paymentMethod: PaymentMethod.STRIPE });

            expect(result.stripeSessionId).toBe('sess-1');
            expect(result.stripeUrl).toBe('https://stripe.com/pay');
            expect(mockPaymentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                paymentMethod: PaymentMethod.STRIPE,
                status: PaymentStatus.PENDING
            }));
        });

        it('should handle Razorpay order creation', async () => {
            mockRazorpayService.createOrder.mockResolvedValue({ id: 'order-1', amount: 500, currency: 'INR' });

            const result = await useCase.execute({ ...mockData, paymentMethod: PaymentMethod.RAZORPAY });

            expect(result.razorpayOrderId).toBe('order-1');
            expect(mockPaymentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                paymentMethod: PaymentMethod.RAZORPAY,
                status: PaymentStatus.PENDING
            }));
        });
    });

    describe('Notifications', () => {
        it('should send notifications to both doctor and patient on full wallet booking', async () => {
            mockDoctorRepo.findProfileById.mockResolvedValue({ id: 'doctor-1', consultationFee: 500 });
            mockAppointmentRepo.getDoctorSchedule.mockResolvedValue({ slotCapacity: 5 });
            mockAppointmentRepo.countActiveBookings.mockResolvedValue(0);
            mockAppointmentRepo.findActiveBookingByPatient.mockResolvedValue(null);
            mockAppointmentRepo.createWithTransaction.mockResolvedValue({ id: 'apt-1', ...mockData });
            mockWalletRepo.findByPatientId.mockResolvedValue({ id: 'wallet-1', balance: 1000 });
            mockQueueService.addToQueue.mockResolvedValue(1);

            await useCase.execute({ ...mockData, useWallet: true });

            expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2);
            expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
                recipientId: 'doctor-1'
            }));
            expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
                recipientId: 'patient-1'
            }));
        });
    });
});
