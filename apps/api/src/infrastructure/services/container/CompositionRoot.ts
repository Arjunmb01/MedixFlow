import { prisma } from "../../database/prismaClient";
import { env } from "@/shared/config/env";
import { mark } from "@/shared/startupProfiler";

// Mappers
import { ConsultationMapper } from "../../database/mappers/ConsultationMapper";
import { SchedulingPolicy } from "../../../domain/services/SchedulingPolicy";
import { SlotGenerator } from "../../../domain/services/SlotGenerator";
import { DoctorMapper } from "../../database/mappers/DoctorMapper";
import { PatientMapper } from "../../database/mappers/PatientMapper";
import { SlotMapper } from "../../database/mappers/SlotMapper";
import { AppointmentMapper } from "../../database/mappers/AppointmentMapper";
import { NotificationMapper } from "../../database/mappers/NotificationMapper";
import { PaymentMapper } from "../../database/mappers/PaymentMapper";
import { WalletMapper } from "../../database/mappers/WalletMapper";

// Repositories
import { PatientRepository } from "../../repositories/PatientRepository";
import { DoctorRepository } from "../../repositories/DoctorRepository";
import { StaffRepository } from "../../repositories/StaffRepository";
import { AuthRepository } from "../../repositories/AuthRepository";
import { ConsultationRepository } from "../../repositories/ConsultationRepository";
import { SlotRepository } from "../../repositories/SlotRepository";
import { AppointmentRepository } from "../../repositories/AppointmentRepository";
import { DoctorLeaveRepository } from "../../repositories/DoctorLeaveRepository";
import { NotificationRepository } from "../../repositories/NotificationRepository";
import { PaymentRepository } from "../../repositories/PaymentRepository";
import { WalletRepository } from "../../repositories/WalletRepository";

// Infrastructure Services
import { BcryptPasswordHasher } from "../BcryptPasswordHasher";
import { RedisSessionService } from "../RedisSessionService";
import { EmailOtpService } from "../EmailOtpService";
import { JwtTokenService } from "../JwtTokenService";
import { GoogleAuthService } from "../GoogleAuthService";
import { SmtpEmailService } from "../SmtpEmailService";
import { PatientIdGenerator } from "../PatientIdGenerator";
import { SystemDateTimeService } from "../SystemDateTimeService";
import { NotificationCacheService } from "../NotificationCacheService";
import { socketService } from "../SocketService";
import { ConsultationSignalingHandler } from "../ConsultationSignalingHandler";
import { RedisConsultationRoomService } from "../RedisConsultationRoomService";
import { ConsultationSessionRepository } from "../../repositories/ConsultationSessionRepository";
import { ConsultationAccessPolicy } from "@/application/services/ConsultationAccessPolicy";
import { getRazorpayService } from "../RazorpayServiceProvider";
import redisClient from "../redisClient";
import { RedisQueueService } from "../RedisQueueService";
import { AppointmentCleanupService } from "../AppointmentCleanupService";
import { RedisService } from "../RedisService";
import { DistributedLockService } from "../DistributedLockService";
import { RabbitMQProducer } from "../../rabbitmq/RabbitMQProducer";

// Use Cases - Auth
import { SignUpUseCase } from "@/application/use-cases/auth/signup.usecase";
import { VerifyOtpUseCase } from "@/application/use-cases/auth/verifyOtp.usecase";
import { LoginPatientUseCase } from "@/application/use-cases/auth/loginPatient.usecase";
import { LoginDoctorUseCase } from "@/application/use-cases/auth/loginDoctor.usecase";
import { LoginAdminUseCase } from "@/application/use-cases/auth/loginAdmin.usecase";
import { LogoutUseCase } from "@/application/use-cases/auth/logout.usecase";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/refreshToken.usecase";
import { ResendOtpUseCase } from "@/application/use-cases/auth/resendOtp.usecase";
import { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgotPassword.usecase";
import { ResetPasswordUseCase } from "@/application/use-cases/auth/resetPassword.usecase";
import { GoogleAuthUseCase } from "@/application/use-cases/auth/googleAuth.usecase";

// Use Cases - Admin
import { ToggleBlockPatientUseCase, DeletePatientUseCase, GetPatientStatsUseCase } from "@/application/use-cases/admin/adminActions.usecase";

// Use Cases - Appointment
import { BookAppointmentUseCase } from "@/application/use-cases/appointment/bookAppointment.usecase";
import { CancelAppointmentUseCase } from "@/application/use-cases/appointment/cancelAppointment.usecase";
import { GetAllAppointmentsUseCase } from "@/application/use-cases/appointment/getAllAppointments.usecase";
import { RescheduleAppointmentUseCase } from "@/application/use-cases/appointment/rescheduleAppointment.usecase";
import { CheckRescheduleConflictUseCase } from "@/application/use-cases/appointment/checkRescheduleConflict.usecase";
import { RefundAppointmentUseCase } from "@/application/use-cases/appointment/RefundAppointmentUseCase";
import { RespondToProposalUseCase } from "@/application/use-cases/appointment/RespondToProposalUseCase";
import { ReassignAppointmentUseCase } from "@/application/use-cases/appointment/ReassignAppointmentUseCase";
import { HandleRazorpayWebhookUseCase } from "@/application/use-cases/payment/HandleRazorpayWebhookUseCase";
import { GetAllPaymentsUseCase } from "@/application/use-cases/payment/GetAllPaymentsUseCase";
import { UpdateAppointmentStatusUseCase } from "@/application/use-cases/appointment/updateAppointmentStatus.usecase";
import { GetAppointmentByIdUseCase } from "@/application/use-cases/appointment/getAppointmentById.usecase";
import { ConfirmPaymentUseCase } from "@/application/use-cases/payment/confirmPayment.usecase";
import { HandleStripeWebhookUseCase } from "@/application/use-cases/payment/HandleStripeWebhookUseCase";
import { HandlePayPalWebhookUseCase } from "@/application/use-cases/payment/HandlePayPalWebhookUseCase";
import { SimulatePaymentUseCase } from "@/application/use-cases/payment/SimulatePaymentUseCase";
import { RetryPaymentUseCase } from "@/application/use-cases/payment/RetryPaymentUseCase";

// Use Cases - Notification
import { GetNotificationsUseCase } from "@/application/use-cases/notification/GetNotificationsUseCase";
import { MarkNotificationAsReadUseCase } from "@/application/use-cases/notification/MarkNotificationAsReadUseCase";
import { GetUnreadCountUseCase } from "@/application/use-cases/notification/GetUnreadCountUseCase";
import { SendNotificationUseCase } from "@/application/use-cases/notification/SendNotificationUseCase";
import { DeleteNotificationsUseCase } from "@/application/use-cases/notification/DeleteNotificationsUseCase";

// Use Cases - Consultation
import { CheckinPatientUseCase } from "@/application/use-cases/consultation/checkinPatient.usecase";
import { CompleteConsultationUseCase } from "@/application/use-cases/consultation/completeConsultation.usecase";
import { GetConsultationDetailsUseCase } from "@/application/use-cases/consultation/getConsultationDetails.usecase";
import { GetDoctorQueueUseCase } from "@/application/use-cases/consultation/getDoctorQueue.usecase";
import { GetPatientHistoryUseCase } from "@/application/use-cases/consultation/getPatientHistory.usecase";
import { StartConsultationUseCase } from "@/application/use-cases/consultation/startConsultation.usecase";
import { JoinVideoWaitingRoomUseCase } from "@/application/use-cases/consultation/JoinVideoWaitingRoomUseCase";
import { StartVideoConsultationUseCase } from "@/application/use-cases/consultation/StartVideoConsultationUseCase";
import { AdmitPatientUseCase } from "@/application/use-cases/consultation/AdmitPatientUseCase";
import { EndVideoConsultationUseCase } from "@/application/use-cases/consultation/EndVideoConsultationUseCase";
import { GetVideoSessionStateUseCase } from "@/application/use-cases/consultation/GetVideoSessionStateUseCase";
import { SendConsultationChatUseCase } from "@/application/use-cases/consultation/SendConsultationChatUseCase";
import { SaveConsultationDraftUseCase } from "@/application/use-cases/consultation/saveConsultationDraft.usecase";
import { GetConsultationDraftUseCase } from "@/application/use-cases/consultation/getConsultationDraft.usecase";
import { CreateFollowUpConsultationUseCase } from "@/application/use-cases/consultation/createFollowUpConsultation.usecase";
import { ScheduleFollowUpUseCase } from "@/application/use-cases/consultation/scheduleFollowUp.usecase";
import { GenerateConsultationPDFUseCase } from "@/application/use-cases/consultation/generateConsultationPDF.usecase";
import { ReviewLabTestUseCase } from "@/application/use-cases/consultation/reviewLabTest.usecase";

// Use Cases - Doctor
import { GetAllDoctorsUseCase } from "@/application/use-cases/doctor/getAllDoctors.usecase";
import { GetConsultedPatientsUseCase } from "@/application/use-cases/doctor/getConsultedPatients.usecase";
import { GetDoctorAppointmentsUseCase } from "@/application/use-cases/doctor/getDoctorAppointments.usecase";
import { GetDoctorDashboardStatsUseCase } from "@/application/use-cases/doctor/getDoctorDashboardStats.usecase";
import { GetDoctorPrescriptionsUseCase } from "@/application/use-cases/doctor/getDoctorPrescriptions.usecase";
import { GetDoctorProfileUseCase } from "@/application/use-cases/doctor/getDoctorProfile.usecase";
import { RequestLabTestUseCase } from "../../../application/use-cases/consultation/requestLabTest.usecase";
import { UploadLabTestUseCase } from "../../../application/use-cases/consultation/uploadLabTest.usecase";
import { GetLabTestsUseCase } from "../../../application/use-cases/consultation/getLabTests.usecase";
import { GetPublicDoctorDetailsUseCase } from "@/application/use-cases/doctor/getPublicDoctorDetails.usecase";
import { UpdateDoctorPasswordUseCase } from "@/application/use-cases/doctor/updateDoctorPassword.usecase";
import { UpdateDoctorProfileUseCase } from "@/application/use-cases/doctor/updateDoctorProfile.usecase";
import { UpdateDoctorSchedulesUseCase } from "@/application/use-cases/doctor/updateDoctorSchedules.usecase";
import { UpdatePrescriptionUseCase } from "@/application/use-cases/doctor/updatePrescription.usecase";
import { ProcessDoctorLeaveUseCase } from "@/application/use-cases/doctor/ProcessDoctorLeaveUseCase";

// Use Cases - Patient
import { CalculateProfileCompletionUseCase } from "@/application/use-cases/patient/CalculateProfileCompletionUseCase";
import { GetAllPatientsUseCase } from "@/application/use-cases/patient/getAllPatients.usecase";
import { GetPatientAppointmentsUseCase } from "@/application/use-cases/patient/getPatientAppointments.usecase";
import { GetPatientByIdUseCase } from "@/application/use-cases/patient/getPatientById.usecase";
import { GetPatientDashboardStatsUseCase } from "@/application/use-cases/patient/getPatientDashboardStats.usecase";
import { GetPatientProfileUseCase } from "@/application/use-cases/patient/getPatientProfile.usecase";
import { GetUpcomingAppointmentsUseCase } from "@/application/use-cases/patient/getUpcomingAppointments.usecase";
import { UpdateEmergencyContactUseCase } from "@/application/use-cases/patient/updateEmergencyContact.usecase";
import { UpdatePasswordUseCase } from "@/application/use-cases/patient/updatePassword.usecase";
import { UpdatePatientProfileUseCase } from "@/application/use-cases/patient/updatePatientProfile.usecase";
import { GetWalletBalanceUseCase } from "@/application/use-cases/patient/GetWalletBalanceUseCase";
import { CreateWalletTopUpUseCase } from "@/application/use-cases/patient/CreateWalletTopUpUseCase";
import { VerifyWalletTopUpUseCase } from "@/application/use-cases/patient/VerifyWalletTopUpUseCase";
import { GetPatientFinancialActivityUseCase } from "@/application/use-cases/patient/GetPatientFinancialActivityUseCase";
import { WalletService } from "@/application/services/WalletService";

// Use Cases - Slot
import { BookSlotUseCase } from "@/application/use-cases/slot/bookSlot.usecase";
import { GenerateSlotsUseCase } from "@/application/use-cases/slot/generateSlots.usecase";
import { GetAvailableSlotCase } from "@/application/use-cases/slot/getAvailableSlots.usecase";

// Use Cases - Staff
import { BlockDoctorUseCase } from "@/application/use-cases/staff/BlockDoctorUseCase";
import { CreateDoctorUseCase } from "@/application/use-cases/staff/CreateDoctorUseCase";
import { DeleteDoctorUseCase } from "@/application/use-cases/staff/DeleteDoctorUseCase";
import { GetDoctorsUseCase } from "@/application/use-cases/staff/GetDoctorsUseCase";
import { SetupPasswordUseCase } from "@/application/use-cases/staff/SetupPasswordUseCase";
import { UpdateStaffDoctorUseCase } from "@/application/use-cases/staff/UpdateStaffDoctorUseCase";

// Use Cases - Leave
import { ApplyLeaveUseCase } from "@/application/use-cases/leave/ApplyLeaveUseCase";
import { GetMyLeavesUseCase } from "@/application/use-cases/leave/GetMyLeavesUseCase";
import { CancelLeaveUseCase } from "@/application/use-cases/leave/CancelLeaveUseCase";
import { GetAllLeavesUseCase } from "@/application/use-cases/leave/GetAllLeavesUseCase";
import { ReviewLeaveUseCase } from "@/application/use-cases/leave/ReviewLeaveUseCase";
import { VerifyStripePaymentUseCase } from "@/application/use-cases/payment/VerifyStripePaymentUseCase";
import { VerifyPayPalPaymentUseCase } from "@/application/use-cases/payment/VerifyPayPalPaymentUseCase";
import { VerifyRazorpayPaymentUseCase } from "@/application/use-cases/payment/VerifyRazorpayPaymentUseCase";

// Controllers
import { AdminAuthController } from "@/presentation/controllers/AdminAuthController";
import { AppointmentController } from "@/presentation/controllers/AppointmentController";
import { NotificationController } from "@/presentation/controllers/NotificationController";
import { ConsultationController } from "@/presentation/controllers/ConsultationController";
import { VideoConsultationController } from "@/presentation/controllers/VideoConsultationController";
import { DoctorAuthController } from "@/presentation/controllers/DoctorAuthController";
import { DoctorProfileController } from "@/presentation/controllers/DoctorProfileController";
import { DoctorAppointmentController } from "@/presentation/controllers/DoctorAppointmentController";
import { DoctorClinicalController } from "@/presentation/controllers/DoctorClinicalController";
import { DoctorSlotController } from "@/presentation/controllers/DoctorSlotController";
import { PatientAuthController } from "@/presentation/controllers/PatientAuthController";
import { PatientProfileController } from "@/presentation/controllers/PatientProfileController";
import { PatientAppointmentController } from "@/presentation/controllers/PatientAppointmentController";
import { AdminPatientController } from "@/presentation/controllers/AdminPatientController";
import { PublicDoctorController } from "@/presentation/controllers/PublicDoctorController";
import { SlotController } from "@/presentation/controllers/SlotController";
import { StaffController } from "@/presentation/controllers/StaffController";
import { LeaveController } from "@/presentation/controllers/LeaveController";
import { PaymentController } from "@/presentation/controllers/PaymentController";
import { createAuthMiddleware } from "@/shared/middlewares/auth.middleware";

export class CompositionRoot {
    static assemble() {
        const jwtConfig = {
            JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
            JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET
        };
        const smtpConfig = {
            host: env.SMTP_HOST || "",
            port: env.SMTP_PORT || 587,
            user: env.SMTP_USER || "",
            pass: env.SMTP_PASS || "",
            from: env.SMTP_FROM || "",
            frontendUrl: env.FRONTEND_URL
        };

        const consultationMapper = new ConsultationMapper();
        const doctorMapper = new DoctorMapper();
        const patientMapper = new PatientMapper();
        const slotMapper = new SlotMapper();
        const appointmentMapper = new AppointmentMapper();
        const notificationMapper = new NotificationMapper();
        const paymentMapper = new PaymentMapper();
        const walletMapper = new WalletMapper();

        // 3. Infrastructure Services
        const passwordHasher = new BcryptPasswordHasher();
        const schedulingPolicy = new SchedulingPolicy();
        const slotGenerator = new SlotGenerator();
        const dateTimeService = new SystemDateTimeService();
        const redisSessionService = new RedisSessionService(redisClient as any);
        const redisService = new RedisService(redisClient as any);
        const lockService = new DistributedLockService(redisClient as any);
        const rabbitMQProducer = new RabbitMQProducer();
        
        const emailService = new SmtpEmailService(smtpConfig);
        const emailOtpService = new EmailOtpService(redisClient as any, emailService);
        const jwtTokenService = new JwtTokenService(jwtConfig);
        const googleAuthService = new GoogleAuthService();
        const patientIdGenerator = new PatientIdGenerator(prisma);
        const notificationCacheService = new NotificationCacheService(redisClient);
        const razorpayService = getRazorpayService();
        const queueService = new RedisQueueService();
        const consultationRoomService = new RedisConsultationRoomService();

        // 4. Repositories
        const patientRepository = new PatientRepository(prisma, patientMapper, dateTimeService);
        const doctorRepository = new DoctorRepository(prisma, doctorMapper, schedulingPolicy);
        const staffRepository = new StaffRepository(prisma, doctorMapper, passwordHasher);
        const authRepository = new AuthRepository(prisma, patientIdGenerator);
        const slotRepository = new SlotRepository(prisma, slotMapper);
        const consultationRepository = new ConsultationRepository(prisma, consultationMapper, dateTimeService);
        const consultationSessionRepository = new ConsultationSessionRepository(prisma);
        const appointmentRepository = new AppointmentRepository(prisma, appointmentMapper, dateTimeService);
        const consultationAccessPolicy = new ConsultationAccessPolicy(
            appointmentRepository,
            consultationSessionRepository,
            dateTimeService
        );
        const appointmentCleanupService = new AppointmentCleanupService(appointmentRepository, lockService);
        const leaveRepository = new DoctorLeaveRepository(prisma);
        const notificationRepository = new NotificationRepository(prisma, notificationMapper);
        const paymentRepository = new PaymentRepository(prisma);
        const walletRepository = new WalletRepository(prisma);
        const walletService = new WalletService(walletRepository);

        // 5. App Logic
        const calculateProfileCompletionUseCase = new CalculateProfileCompletionUseCase();

        // 6. Use Cases
        // Auth
        const signUpUseCase = new SignUpUseCase(authRepository, emailOtpService, emailService, passwordHasher);
        const verifyOtpUseCase = new VerifyOtpUseCase(authRepository, emailOtpService);
        const loginPatientUseCase = new LoginPatientUseCase(authRepository, jwtTokenService, redisSessionService, passwordHasher);
        const loginDoctorUseCase = new LoginDoctorUseCase(authRepository, jwtTokenService, redisSessionService, passwordHasher);
        const loginAdminUseCase = new LoginAdminUseCase(authRepository, jwtTokenService, redisSessionService, passwordHasher);
        const logoutUseCase = new LogoutUseCase(redisSessionService);
        const refreshTokenUseCase = new RefreshTokenUseCase(redisSessionService, authRepository, jwtTokenService);
        const resendOtpUseCase = new ResendOtpUseCase(authRepository, emailOtpService, emailService);
        const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository, emailService);
        const resetPasswordUseCase = new ResetPasswordUseCase(authRepository, passwordHasher);
        const googleAuthUseCase = new GoogleAuthUseCase(authRepository, jwtTokenService, redisSessionService, googleAuthService);

        // Admin
        const toggleBlockPatientUseCase = new ToggleBlockPatientUseCase(patientRepository, redisSessionService);
        const deletePatientUseCase = new DeletePatientUseCase(patientRepository);
        const getPatientStatsUseCase = new GetPatientStatsUseCase(patientRepository, staffRepository);

        // Notification
        const sendNotificationUseCase = new SendNotificationUseCase(notificationRepository, notificationCacheService, socketService);
        const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository, notificationCacheService);
        const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository, notificationCacheService, socketService);
        const getUnreadCountUseCase = new GetUnreadCountUseCase(notificationRepository, notificationCacheService);
        const deleteNotificationsUseCase = new DeleteNotificationsUseCase(notificationRepository, notificationCacheService, socketService);
        const confirmPaymentUseCase = new ConfirmPaymentUseCase(paymentRepository, appointmentRepository, queueService, socketService, sendNotificationUseCase, lockService);
        const handleRazorpayWebhookUseCase = new HandleRazorpayWebhookUseCase(razorpayService, paymentRepository, walletRepository, appointmentRepository, sendNotificationUseCase, queueService, socketService, confirmPaymentUseCase);
        const handleStripeWebhookUseCase = new HandleStripeWebhookUseCase(paymentRepository, appointmentRepository, confirmPaymentUseCase, walletService);
        const handlePayPalWebhookUseCase = new HandlePayPalWebhookUseCase(paymentRepository, confirmPaymentUseCase);
        const simulatePaymentUseCase = new SimulatePaymentUseCase(paymentRepository, appointmentRepository, confirmPaymentUseCase);
        const retryPaymentUseCase = new RetryPaymentUseCase(paymentRepository, appointmentRepository, patientRepository);
        const refundAppointmentUseCase = new RefundAppointmentUseCase(paymentRepository, walletRepository, appointmentRepository, razorpayService);

        // Appointment
        const bookAppointmentUseCase = new BookAppointmentUseCase(
            appointmentRepository, 
            schedulingPolicy, 
            dateTimeService, 
            sendNotificationUseCase,
            paymentRepository,
            walletRepository,
            razorpayService,
            doctorRepository,
            patientRepository,
            queueService,
            socketService,
            lockService
        );
        const cancelAppointmentUseCase = new CancelAppointmentUseCase(
            appointmentRepository, 
            consultationRepository, 
            sendNotificationUseCase,
            paymentRepository,
            walletRepository,
            queueService,
            socketService,
            refundAppointmentUseCase
        );
        const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase(
            appointmentRepository,
            queueService,
            socketService
        );
        const getAllAppointmentsUseCase = new GetAllAppointmentsUseCase(appointmentRepository);
        const getAppointmentByIdUseCase = new GetAppointmentByIdUseCase(appointmentRepository);
        const rescheduleAppointmentUseCase = new RescheduleAppointmentUseCase(appointmentRepository, schedulingPolicy, dateTimeService, sendNotificationUseCase);
        const checkRescheduleConflictUseCase = new CheckRescheduleConflictUseCase(appointmentRepository, dateTimeService);
        const respondToProposalUseCase = new RespondToProposalUseCase(appointmentRepository, sendNotificationUseCase, dateTimeService);
        const reassignAppointmentUseCase = new ReassignAppointmentUseCase(appointmentRepository, sendNotificationUseCase);
        const processDoctorLeaveUseCase = new ProcessDoctorLeaveUseCase(appointmentRepository, sendNotificationUseCase, dateTimeService);




        // Consultation
        const checkinPatientUseCase = new CheckinPatientUseCase(appointmentRepository, consultationRepository, dateTimeService);
        const completeConsultationUseCase = new CompleteConsultationUseCase(consultationRepository, appointmentRepository, sendNotificationUseCase);
        const getConsultationDetailsUseCase = new GetConsultationDetailsUseCase(consultationRepository);
        const getDoctorQueueUseCase = new GetDoctorQueueUseCase(consultationRepository);
        const getPatientHistoryUseCase = new GetPatientHistoryUseCase(consultationRepository);
        const startConsultationUseCase = new StartConsultationUseCase(consultationRepository);
        const requestLabTestUseCase = new RequestLabTestUseCase(consultationRepository, sendNotificationUseCase);
        const uploadLabTestUseCase = new UploadLabTestUseCase(consultationRepository, sendNotificationUseCase);
        const getLabTestsUseCase = new GetLabTestsUseCase(consultationRepository);
        const saveConsultationDraftUseCase = new SaveConsultationDraftUseCase(consultationRepository);
        const getConsultationDraftUseCase = new GetConsultationDraftUseCase(consultationRepository);
        const createFollowUpConsultationUseCase = new CreateFollowUpConsultationUseCase(appointmentRepository, consultationRepository, dateTimeService);
        const scheduleFollowUpUseCase = new ScheduleFollowUpUseCase(consultationRepository, appointmentRepository, dateTimeService, sendNotificationUseCase);
        const generateConsultationPDFUseCase = new GenerateConsultationPDFUseCase(consultationRepository);
        const reviewLabTestUseCase = new ReviewLabTestUseCase(consultationRepository, sendNotificationUseCase);

        const joinVideoWaitingRoomUseCase = new JoinVideoWaitingRoomUseCase(
            consultationAccessPolicy,
            consultationRepository,
            consultationSessionRepository,
            consultationRoomService
        );
        const startVideoConsultationUseCase = new StartVideoConsultationUseCase(
            consultationAccessPolicy,
            consultationRepository,
            consultationSessionRepository,
            consultationRoomService,
            socketService
        );
        const admitPatientUseCase = new AdmitPatientUseCase(
            consultationAccessPolicy,
            consultationSessionRepository,
            consultationRoomService,
            socketService
        );
        const endVideoConsultationUseCase = new EndVideoConsultationUseCase(
            consultationAccessPolicy,
            consultationSessionRepository,
            consultationRepository,
            appointmentRepository,
            consultationRoomService,
            socketService,
            sendNotificationUseCase
        );
        const getVideoSessionStateUseCase = new GetVideoSessionStateUseCase(
            consultationAccessPolicy,
            consultationSessionRepository,
            consultationRoomService
        );
        const sendConsultationChatUseCase = new SendConsultationChatUseCase(
            consultationAccessPolicy,
            consultationSessionRepository,
            socketService
        );

        // Doctor
        const getAllDoctorsUseCase = new GetAllDoctorsUseCase(doctorRepository);
        const getConsultedPatientsUseCase = new GetConsultedPatientsUseCase(doctorRepository);
        const getDoctorAppointmentsUseCase = new GetDoctorAppointmentsUseCase(appointmentRepository, dateTimeService);
        const getDoctorDashboardStatsUseCase = new GetDoctorDashboardStatsUseCase(doctorRepository, dateTimeService);
        const getDoctorPrescriptionsUseCase = new GetDoctorPrescriptionsUseCase(doctorRepository);
        const getDoctorProfileUseCase = new GetDoctorProfileUseCase(doctorRepository);
        const getPublicDoctorDetailsUseCase = new GetPublicDoctorDetailsUseCase(doctorRepository);
        const updateDoctorPasswordUseCase = new UpdateDoctorPasswordUseCase(doctorRepository, passwordHasher);
        const updateDoctorProfileUseCase = new UpdateDoctorProfileUseCase(doctorRepository);
        const updateDoctorSchedulesUseCase = new UpdateDoctorSchedulesUseCase(doctorRepository);
        const updatePrescriptionUseCase = new UpdatePrescriptionUseCase(doctorRepository);

        // Patient
        const getAllPatientsUseCase = new GetAllPatientsUseCase(patientRepository);
        const getPatientAppointmentsUseCase = new GetPatientAppointmentsUseCase(appointmentRepository);
        const getPatientByIdUseCase = new GetPatientByIdUseCase(patientRepository);
        const getPatientDashboardStatsUseCase = new GetPatientDashboardStatsUseCase(appointmentRepository, patientRepository, calculateProfileCompletionUseCase);
        const getPatientProfileUseCase = new GetPatientProfileUseCase(patientRepository, calculateProfileCompletionUseCase);
        const getUpcomingAppointmentsUseCase = new GetUpcomingAppointmentsUseCase(appointmentRepository, dateTimeService);
        const updateEmergencyContactUseCase = new UpdateEmergencyContactUseCase(patientRepository);
        const updatePasswordUseCase = new UpdatePasswordUseCase(patientRepository, passwordHasher);
        const updatePatientProfileUseCase = new UpdatePatientProfileUseCase(patientRepository, calculateProfileCompletionUseCase);
        const getWalletBalanceUseCase = new GetWalletBalanceUseCase(walletRepository);
        const topUpWalletUseCase = new CreateWalletTopUpUseCase();
        const verifyWalletTopUpUseCase = new VerifyWalletTopUpUseCase(razorpayService, walletRepository);
        const getPatientFinancialActivityUseCase = new GetPatientFinancialActivityUseCase(prisma);
        const getAllPaymentsUseCase = new GetAllPaymentsUseCase(paymentRepository);

        // Slot
        const bookSlotUseCase = new BookSlotUseCase(appointmentRepository);
        const generateSlotsUseCase = new GenerateSlotsUseCase(slotRepository, doctorRepository, schedulingPolicy);
        const getAvailableSlotCase = new GetAvailableSlotCase(doctorRepository, appointmentRepository, leaveRepository, slotGenerator);

        // Staff
        const blockDoctorUseCase = new BlockDoctorUseCase(staffRepository, redisSessionService);
        const createDoctorUseCase = new CreateDoctorUseCase(staffRepository, emailService);
        const deleteDoctorUseCase = new DeleteDoctorUseCase(staffRepository);
        const getDoctorsUseCase = new GetDoctorsUseCase(staffRepository);
        const setupPasswordUseCase = new SetupPasswordUseCase(staffRepository);
        const updateStaffDoctorUseCase = new UpdateStaffDoctorUseCase(staffRepository);

        // Leave
        const applyLeaveUseCase = new ApplyLeaveUseCase(leaveRepository, appointmentRepository, sendNotificationUseCase, cancelAppointmentUseCase);
        const getMyLeavesUseCase = new GetMyLeavesUseCase(leaveRepository);
        const cancelLeaveUseCase = new CancelLeaveUseCase(leaveRepository);
        const getAllLeavesUseCase = new GetAllLeavesUseCase(leaveRepository);
        const reviewLeaveUseCase = new ReviewLeaveUseCase(leaveRepository);

        // Middlewares
        const authMiddleware = createAuthMiddleware(jwtTokenService, authRepository);

        // Controllers
        const adminAuthController = new AdminAuthController(loginAdminUseCase, refreshTokenUseCase, logoutUseCase);
        const appointmentController = new AppointmentController(getAvailableSlotCase, bookAppointmentUseCase, updateAppointmentStatusUseCase, getAppointmentByIdUseCase, checkRescheduleConflictUseCase);
        const notificationController = new NotificationController(
            getNotificationsUseCase, markNotificationAsReadUseCase, 
            getUnreadCountUseCase, deleteNotificationsUseCase
        );
        
        const consultationController = new ConsultationController(
            checkinPatientUseCase, getDoctorQueueUseCase, startConsultationUseCase, 
            completeConsultationUseCase, getPatientHistoryUseCase, getConsultationDetailsUseCase,
            requestLabTestUseCase, uploadLabTestUseCase, getLabTestsUseCase,
            saveConsultationDraftUseCase, getConsultationDraftUseCase,
            createFollowUpConsultationUseCase, scheduleFollowUpUseCase, 
            generateConsultationPDFUseCase, reviewLabTestUseCase
        );

        const videoConsultationController = new VideoConsultationController(
            joinVideoWaitingRoomUseCase,
            startVideoConsultationUseCase,
            admitPatientUseCase,
            endVideoConsultationUseCase,
            getVideoSessionStateUseCase,
            sendConsultationChatUseCase
        );

        const consultationSignalingHandler = new ConsultationSignalingHandler(
            () => socketService.getIO(),
            jwtTokenService,
            consultationRoomService,
            consultationSessionRepository,
            consultationAccessPolicy
        );

        const doctorAuthController = new DoctorAuthController(
            loginDoctorUseCase, refreshTokenUseCase, logoutUseCase, forgotPasswordUseCase, resetPasswordUseCase
        );
        
        const doctorProfileController = new DoctorProfileController(
            getDoctorProfileUseCase, updateDoctorProfileUseCase, updateDoctorPasswordUseCase
        );
        
        const doctorAppointmentController = new DoctorAppointmentController(
            getDoctorDashboardStatsUseCase, getDoctorAppointmentsUseCase, 
            updateDoctorSchedulesUseCase, generateSlotsUseCase, rescheduleAppointmentUseCase,
            reassignAppointmentUseCase, processDoctorLeaveUseCase
        );

        const doctorClinicalController = new DoctorClinicalController(
            getConsultedPatientsUseCase, getDoctorPrescriptionsUseCase, updatePrescriptionUseCase
        );
        
        const doctorSlotController = new DoctorSlotController(getAvailableSlotCase);

        const patientAuthController = new PatientAuthController(
            signUpUseCase, verifyOtpUseCase, loginPatientUseCase, googleAuthUseCase, 
            refreshTokenUseCase, logoutUseCase, resendOtpUseCase, forgotPasswordUseCase, resetPasswordUseCase
        );
        
        const patientProfileController = new PatientProfileController(
            updatePatientProfileUseCase, updateEmergencyContactUseCase, getPatientProfileUseCase, 
            updatePasswordUseCase
        );

        const patientAppointmentController = new PatientAppointmentController(
            getUpcomingAppointmentsUseCase, getPatientDashboardStatsUseCase, getPatientAppointmentsUseCase, 
            cancelAppointmentUseCase, rescheduleAppointmentUseCase, respondToProposalUseCase
        );

        const adminPatientController = new AdminPatientController(
            getAllPatientsUseCase, getPatientByIdUseCase, toggleBlockPatientUseCase, 
            deletePatientUseCase, getPatientStatsUseCase, getAllAppointmentsUseCase, rescheduleAppointmentUseCase
        );

        const publicDoctorController = new PublicDoctorController(getAllDoctorsUseCase, getPublicDoctorDetailsUseCase);
        
        const slotController = new SlotController(generateSlotsUseCase, getAvailableSlotCase, bookSlotUseCase);
        
        const staffController = new StaffController(
            getDoctorsUseCase, createDoctorUseCase, updateStaffDoctorUseCase, 
            blockDoctorUseCase, deleteDoctorUseCase, setupPasswordUseCase
        );

        const leaveController = new LeaveController(
            applyLeaveUseCase,
            getMyLeavesUseCase,
            cancelLeaveUseCase,
            getAllLeavesUseCase,
            reviewLeaveUseCase
        );

        const verifyStripePaymentUseCase = new VerifyStripePaymentUseCase(paymentRepository, confirmPaymentUseCase);
        const verifyPayPalPaymentUseCase = new VerifyPayPalPaymentUseCase(paymentRepository, confirmPaymentUseCase);
        const verifyRazorpayPaymentUseCase = new VerifyRazorpayPaymentUseCase(paymentRepository, razorpayService, confirmPaymentUseCase);

        const paymentController = new PaymentController(
            handleRazorpayWebhookUseCase,
            getWalletBalanceUseCase,
            topUpWalletUseCase,
            verifyWalletTopUpUseCase,
            getPatientFinancialActivityUseCase,
            getAllPaymentsUseCase,
            handleStripeWebhookUseCase,
            handlePayPalWebhookUseCase,
            simulatePaymentUseCase,
            retryPaymentUseCase,
            verifyStripePaymentUseCase,
            verifyPayPalPaymentUseCase,
            verifyRazorpayPaymentUseCase
        );

        return {
            adminAuthController,
            appointmentController,
            notificationController,
            consultationController,
            doctorAuthController,
            doctorProfileController,
            doctorAppointmentController,
            doctorClinicalController,
            doctorSlotController,
            patientAuthController,
            patientProfileController,
            patientAppointmentController,
            adminPatientController,
            publicDoctorController,
            slotController,
            staffController,
            leaveController,
            paymentController,
            videoConsultationController,
            consultationSignalingHandler,
            authMiddleware,
            appointmentCleanupService
        };
    }
}

export type AppContainer = ReturnType<typeof CompositionRoot.assemble>;

let _container: AppContainer | null = null;

/** Assembles DI graph on first call — not at module import time. */
export function getContainer(): AppContainer {
  if (!_container) {
    mark("composition_start");
    _container = CompositionRoot.assemble();
    mark("composition_end");
  }
  return _container;
}

