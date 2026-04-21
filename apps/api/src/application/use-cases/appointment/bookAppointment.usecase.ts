import { IAppointmentRepository, AppointmentRecord } from "../../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentInput } from "../../../domain/value-objects/types/appointment.types";
import { SchedulingPolicy } from "../../../domain/services/SchedulingPolicy";
import { IDateTimeService } from "../../../domain/services/IDateTimeService";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { IDoctorProfileRepository } from "../../../domain/repositories/IDoctorRepository";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";
import { config } from "../../../infrastructure/services/config";

export class BookAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly schedulingPolicy: SchedulingPolicy,
        private readonly dateTimeService: IDateTimeService,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly paymentRepo: IPaymentRepository,
        private readonly walletRepo: IWalletRepository,
        private readonly razorpayService: IRazorpayService,
        private readonly doctorRepo: IDoctorProfileRepository
    ) { }

    async execute(data: CreateAppointmentInput): Promise<AppointmentRecord & { razorpayOrderId?: string; razorpayKeyId?: string; amount?: number; currency?: string }> {
        if (!data.patientId || !data.doctorId) {
            throw new Error("Invalid patient or doctor");
        }

        if (!data.appointmentDate) {
            throw new Error("Invalid date");
        }

        if (!data.slotStart || !data.slotEnd) {
            throw new Error("Invalid slot");
        }

        const now = this.dateTimeService.now();
        const year = data.appointmentDate.getUTCFullYear();
        const month = data.appointmentDate.getUTCMonth();
        const day = data.appointmentDate.getUTCDate();
        const [hours, minutes] = data.slotStart.split(":").map(Number);

        const appointmentTime = new Date(year, month, day, hours, minutes, 0, 0);

        if (appointmentTime < now) {
            throw new Error("Cannot book an appointment in the past");
        }

        const doctorProfile = await this.doctorRepo.findProfileById(data.doctorId);
        if (!doctorProfile) {
            throw new Error("Doctor not found");
        }

        const schedule = await this.appointmentRepo.getDoctorSchedule(data.doctorId, data.appointmentDate.getDay());
        const capacity = schedule?.slotCapacity ?? (schedule ? this.schedulingPolicy.calculateSlotCapacity(schedule.slotDurationMinutes) : 5);

        const activeBookings = await this.appointmentRepo.countActiveBookings(data.doctorId, data.appointmentDate, data.slotStart);

        if (activeBookings >= capacity) {
            throw new Error(`Slot is full (capacity: ${capacity} patients)`);
        }

        const existingPatientBooking = await this.appointmentRepo.findActiveBookingByPatient(
            data.patientId,
            data.appointmentDate,
            data.doctorId,
            data.slotStart
        );

        if (existingPatientBooking) {
            if (existingPatientBooking.slotStart === data.slotStart) {
                throw new Error("You already have an active appointment at this time.");
            } else {
                throw new Error("You already have an active appointment with this doctor today.");
            }
        }

        const appointment = await this.appointmentRepo.createWithTransaction({
            ...data,
            status: AppointmentStatus.PENDING
        } as any);

        const amount = doctorProfile.consultationFee;
        const currency = "inr";
        const paymentMethod = data.paymentMethod || PaymentMethod.RAZORPAY;

        if (paymentMethod === PaymentMethod.WALLET) {
            const wallet = await this.walletRepo.findByPatientId(data.patientId);
            if (!wallet || !wallet.hasSufficientBalance(amount)) {
                // If wallet doesn't exist or insufficient, we could delete the pending appointment or just fail
                // For now, fail.
                throw new Error("Insufficient wallet balance");
            }

            // Deduct from wallet
            await this.walletRepo.updateBalance(wallet.id, -amount, TransactionType.PAYMENT, `Payment for Appointment ${appointment.id}`);

            // Update Appointment to CONFIRMED
            await this.appointmentRepo.updateStatus(appointment.id, AppointmentStatus.CONFIRMED);

            // Create Payment record as PAID
            await this.paymentRepo.create({
                appointmentId: appointment.id,
                patientId: data.patientId,
                amount,
                currency,
                razorpayOrderId: `wallet_${appointment.id}`, // Placeholder
                paymentMethod: PaymentMethod.WALLET,
                status: PaymentStatus.PAID
            });

            // Notify Doctor & Patient (Immediate for Wallet)
            await this.sendNotifications(data, appointment);

            return { ...appointment, status: AppointmentStatus.CONFIRMED };
        } else {
            // RAZORPAY FLOW
            const razorpayOrder = await this.razorpayService.createOrder({
                amount,
                currency,
                receipt: appointment.id,
                notes: {
                    appointmentId: appointment.id,
                    patientId: data.patientId,
                },
            });

            // Create Payment record as PENDING
            await this.paymentRepo.create({
                appointmentId: appointment.id,
                patientId: data.patientId,
                amount,
                currency,
                razorpayOrderId: razorpayOrder.id,
                paymentMethod: PaymentMethod.RAZORPAY,
                status: PaymentStatus.PENDING
            } as any);

            return {
                ...appointment,
                razorpayOrderId: razorpayOrder.id,
                razorpayKeyId: config.razorpayKeyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            };
        }
    }

    private async sendNotifications(data: CreateAppointmentInput, appointment: AppointmentRecord) {
        // Notify Doctor
        await this.sendNotificationUseCase.execute({
            recipientId: data.doctorId,
            title: "New Appointment Booked",
            message: `A new appointment has been scheduled for ${data.appointmentDate.toLocaleDateString()} at ${data.slotStart}.`,
            type: NotificationType.BOOKED,
        });

        // Notify Patient
        await this.sendNotificationUseCase.execute({
            recipientId: data.patientId,
            title: "Booking Confirmed",
            message: `Your appointment with the doctor is confirmed for ${data.appointmentDate.toLocaleDateString()} at ${data.slotStart}.`,
            type: NotificationType.BOOKED,
        });
    }
}
