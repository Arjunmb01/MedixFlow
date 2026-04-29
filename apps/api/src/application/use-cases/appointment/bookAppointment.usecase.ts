import { IAppointmentRepository, AppointmentRecord } from "../../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentInput } from "../../../domain/value-objects/types/appointment.types";
import { SchedulingPolicy } from "../../../domain/services/SchedulingPolicy";
import { IDateTimeService } from "../../../domain/services/IDateTimeService";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { IRazorpayService } from "../../../domain/services/IRazorpayService";
import { IPatientRepository } from "../../../domain/repositories/IPatientRepository";
import { IDoctorProfileRepository } from "../../../domain/repositories/IDoctorRepository";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { TransactionType } from "../../../domain/value-objects/enums/TransactionType";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";
import { env as config } from "../../../shared/config/env";
import { IQueueService } from "../../../domain/services/IQueueService";
import { SocketService } from "../../../infrastructure/services/SocketService";
import { PaymentGatewayFactory } from "../../../infrastructure/services/PaymentGatewayFactory";
import { AppError } from "@/shared/errors/AppError";
import { StatusCode } from "@/shared/constants/statusCodes";

export class BookAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly schedulingPolicy: SchedulingPolicy,
        private readonly dateTimeService: IDateTimeService,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly paymentRepo: IPaymentRepository,
        private readonly walletRepo: IWalletRepository,
        private readonly razorpayService: IRazorpayService,
        private readonly doctorRepo: IDoctorProfileRepository,
        private readonly patientRepo: IPatientRepository,
        private readonly queueService: IQueueService,
        private readonly socketService: SocketService
    ) { }

    async execute(data: CreateAppointmentInput): Promise<AppointmentRecord & { 
        razorpayOrderId?: string; 
        razorpayKeyId?: string; 
        amount?: number; 
        currency?: string;
        stripeSessionId?: string;
        stripeUrl?: string;
        paypalOrderId?: string;
        paypalUrl?: string;
    }> {
        if (!data.patientId || !data.doctorId) {
            throw new AppError("Invalid patient or doctor", StatusCode.BAD_REQUEST);
        }

        if (!data.appointmentDate) {
            throw new AppError("Invalid date", StatusCode.BAD_REQUEST);
        }

        if (!data.slotStart || !data.slotEnd) {
            throw new AppError("Invalid slot", StatusCode.BAD_REQUEST);
        }

        const now = this.dateTimeService.now();
        const year = data.appointmentDate.getUTCFullYear();
        const month = data.appointmentDate.getUTCMonth();
        const day = data.appointmentDate.getUTCDate();
        const [hours, minutes] = data.slotStart.split(":").map(Number);

        const appointmentTime = new Date(year, month, day, hours, minutes, 0, 0);

        if (appointmentTime < now) {
            throw new AppError("Cannot book an appointment in the past", StatusCode.BAD_REQUEST);
        }

        const doctorProfile = await this.doctorRepo.findProfileById(data.doctorId);
        if (!doctorProfile) {
            throw new AppError("Doctor not found", StatusCode.NOT_FOUND);
        }

        const schedule = await this.appointmentRepo.getDoctorSchedule(data.doctorId, data.appointmentDate.getDay());
        const capacity = schedule?.slotCapacity ?? (schedule ? this.schedulingPolicy.calculateSlotCapacity(schedule.slotDurationMinutes) : 5);

        const activeBookings = await this.appointmentRepo.countActiveBookings(data.doctorId, data.appointmentDate, data.slotStart);

        if (activeBookings >= capacity) {
            throw new AppError(`Slot is full (capacity: ${capacity} patients)`, StatusCode.BAD_REQUEST);
        }

        const existingBooking = await this.appointmentRepo.findActiveBookingByPatient(
            data.patientId,
            data.appointmentDate,
            data.doctorId,
            data.slotStart
        );

        if (existingBooking) {
            if (existingBooking.slotStart === data.slotStart) {
                throw new AppError("You already have an active appointment at this time.", StatusCode.BAD_REQUEST);
            }
            if (existingBooking.doctorId === data.doctorId) {
                throw new AppError("You already have an appointment with this doctor on this date.", StatusCode.BAD_REQUEST);
            }
        }

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins hold

        const appointment = await this.appointmentRepo.createWithTransaction({
            ...data,
            status: AppointmentStatus.PENDING,
            expiresAt
        } as any);

        const totalAmount = doctorProfile.consultationFee;
        const currency = "inr";
        let walletContribution = 0;
        let remainingAmount = totalAmount;

        if (data.useWallet) {
            const wallet = await this.walletRepo.findByPatientId(data.patientId);
            if (wallet && wallet.balance > 0) {
                walletContribution = Math.min(wallet.balance, totalAmount);
                remainingAmount = totalAmount - walletContribution;
                
                // Deduct from wallet immediately
                await this.walletRepo.updateBalance(
                    wallet.id, 
                    -walletContribution, 
                    TransactionType.PAYMENT, 
                    `Wallet contribution for Appointment ${appointment.id}`
                );
            }
        }

        if (remainingAmount === 0) {
            // Full Wallet Payment
            await this.appointmentRepo.updateStatus(appointment.id, AppointmentStatus.BOOKED);
            
            const queueNumber = await this.queueService.addToQueue(data.doctorId, data.appointmentDate, appointment.id);
            await this.appointmentRepo.updateQueuePosition(appointment.id, queueNumber);

            await this.paymentRepo.create({
                appointmentId: appointment.id,
                patientId: data.patientId,
                amount: totalAmount,
                currency,
                walletAmount: totalAmount,
                paymentMethod: PaymentMethod.WALLET,
                status: PaymentStatus.PAID
            });

            this.socketService.emitAppointmentBooked(data.doctorId, { ...appointment, queueNumber, status: AppointmentStatus.BOOKED });
            const fullQueue = await this.appointmentRepo.getTodaysQueue(data.doctorId);
            this.socketService.emitQueueUpdated(data.doctorId, data.appointmentDate, fullQueue);
            
            await this.sendNotifications(data, appointment);

            return appointment;
        }

        // Mixed or Full Gateway Payment
        const paymentMethod = data.paymentMethod || PaymentMethod.STRIPE;

        if (paymentMethod === PaymentMethod.STRIPE) {
            const patient = await this.patientRepo.findById(data.patientId);
            const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.STRIPE);
            
            const session = await gateway.createSession({
                appointmentId: appointment.id,
                amount: remainingAmount,
                currency,
                customerEmail: patient?.email || undefined,
                successUrl: `${config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment.id}`,
                cancelUrl: `${config.FRONTEND_URL}/patient/billing?status=failed&appointment_id=${appointment.id}`,
                metadata: { appointmentId: appointment.id, patientId: data.patientId }
            });

            await this.paymentRepo.create({
                appointmentId: appointment.id,
                patientId: data.patientId,
                amount: remainingAmount,
                currency,
                walletAmount: walletContribution,
                stripeSessionId: session.id,
                paymentMethod: PaymentMethod.STRIPE,
                status: PaymentStatus.PENDING
            });

            return {
                ...appointment,
                stripeSessionId: session.id,
                stripeUrl: session.url,
                amount: remainingAmount,
                currency
            };
        } else if (paymentMethod === PaymentMethod.RAZORPAY) {
            const razorpayOrder = await this.razorpayService.createOrder({
                amount: remainingAmount,
                currency,
                receipt: appointment.id,
                notes: { appointmentId: appointment.id, patientId: data.patientId },
            });

            await this.paymentRepo.create({
                appointmentId: appointment.id,
                patientId: data.patientId,
                amount: remainingAmount,
                currency,
                walletAmount: walletContribution,
                razorpayOrderId: razorpayOrder.id,
                paymentMethod: PaymentMethod.RAZORPAY,
                status: PaymentStatus.PENDING
            });

            return {
                ...appointment,
                razorpayOrderId: razorpayOrder.id,
                razorpayKeyId: config.RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            };
        } else if (paymentMethod === PaymentMethod.PAYPAL) {
            const gateway = PaymentGatewayFactory.getGateway(PaymentMethod.PAYPAL);
            const order = await gateway.createSession({
                appointmentId: appointment.id,
                amount: remainingAmount,
                currency: "USD",
                successUrl: `${config.FRONTEND_URL}/payment/success?token={TOKEN}&appointment_id=${appointment.id}`,
                cancelUrl: `${config.FRONTEND_URL}/payment/cancel?appointment_id=${appointment.id}`
            });

            await this.paymentRepo.create({
                appointmentId: appointment.id,
                patientId: data.patientId,
                amount: remainingAmount,
                currency: "USD",
                walletAmount: walletContribution,
                paypalOrderId: order.id,
                paymentMethod: PaymentMethod.PAYPAL,
                status: PaymentStatus.PENDING
            });

            return {
                ...appointment,
                paypalOrderId: order.id,
                paypalUrl: order.url,
                amount: remainingAmount,
                currency: "USD"
            };
        } else {
            throw new AppError(`Unsupported payment method: ${paymentMethod}`, StatusCode.BAD_REQUEST);
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
            title: "Booking BOOKED",
            message: `Your appointment with the doctor is BOOKED for ${data.appointmentDate.toLocaleDateString()} at ${data.slotStart}.`,
            type: NotificationType.BOOKED,
        });
    }
}
