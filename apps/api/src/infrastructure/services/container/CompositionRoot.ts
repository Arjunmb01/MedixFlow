import { prisma } from "../../database/prismaClient";
import { config } from "../config";

// Mappers
import { ConsultationMapper } from "../../database/mappers/ConsultationMapper";
import { SchedulingPolicy } from "../../../domain/services/SchedulingPolicy";
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
import { RazorpayService } from "../RazorpayService";
import redisClient from "../redisClient";

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
import { HandleRazorpayWebhookUseCase } from "@/application/use-cases/payment/HandleRazorpayWebhookUseCase";

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
import { TopUpWalletUseCase } from "@/application/use-cases/patient/TopUpWalletUseCase";
import { VerifyWalletTopUpUseCase } from "@/application/use-cases/patient/VerifyWalletTopUpUseCase";
import { GetPatientFinancialActivityUseCase } from "@/application/use-cases/patient/GetPatientFinancialActivityUseCase";

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

// Controllers
import { AdminAuthController } from "@/presentation/controllers/AdminAuthController";
import { AppointmentController } from "@/presentation/controllers/AppointmentController";
import { NotificationController } from "@/presentation/controllers/NotificationController";
import { ConsultationController } from "@/presentation/controllers/ConsultationController";
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
import { createAuthMiddleware } from "@/presentation/controllers/middleware/auth.middleware";

export class CompositionRoot {
    static assemble() {
        const jwtConfig = {
            jwtAccessSecret: config.jwtAccessSecret,
            jwtRefreshSecret: config.jwtRefreshSecret
        };
        const smtpConfig = {
            host: config.smtp.host,
            port: config.smtp.port,
            user: config.smtp.user,
            pass: config.smtp.pass,
            from: config.smtp.from,
            frontendUrl: config.frontendUrl
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
        const dateTimeService = new SystemDateTimeService();
        const redisSessionService = new RedisSessionService(redisClient);
        const emailService = new SmtpEmailService(smtpConfig);
        const emailOtpService = new EmailOtpService(redisClient, emailService);
        const jwtTokenService = new JwtTokenService(jwtConfig);
        const googleAuthService = new GoogleAuthService();
        const patientIdGenerator = new PatientIdGenerator(prisma);
        const notificationCacheService = new NotificationCacheService(redisClient);
        const razorpayService = new RazorpayService();

        // 4. Repositories
        const patientRepository = new PatientRepository(prisma, patientMapper, dateTimeService);
        const doctorRepository = new DoctorRepository(prisma, doctorMapper, schedulingPolicy);
        const staffRepository = new StaffRepository(prisma, doctorMapper, passwordHasher);
        const authRepository = new AuthRepository(prisma, patientIdGenerator);
        const slotRepository = new SlotRepository(prisma, slotMapper);
        const consultationRepository = new ConsultationRepository(prisma, consultationMapper, dateTimeService);
        const appointmentRepository = new AppointmentRepository(prisma, appointmentMapper, dateTimeService);
        const leaveRepository = new DoctorLeaveRepository(prisma);
        const notificationRepository = new NotificationRepository(prisma, notificationMapper);
        const paymentRepository = new PaymentRepository(prisma);
        const walletRepository = new WalletRepository(prisma);

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
        const handleRazorpayWebhookUseCase = new HandleRazorpayWebhookUseCase(razorpayService, paymentRepository, walletRepository, appointmentRepository, sendNotificationUseCase);

        // Appointment
        const bookAppointmentUseCase = new BookAppointmentUseCase(
            appointmentRepository, 
            schedulingPolicy, 
            dateTimeService, 
            sendNotificationUseCase,
            paymentRepository,
            walletRepository,
            razorpayService,
            doctorRepository
        );
        const cancelAppointmentUseCase = new CancelAppointmentUseCase(
            appointmentRepository, 
            consultationRepository, 
            sendNotificationUseCase,
            paymentRepository,
            razorpayService,
            walletRepository
        );
        const getAllAppointmentsUseCase = new GetAllAppointmentsUseCase(appointmentRepository);
        const rescheduleAppointmentUseCase = new RescheduleAppointmentUseCase(appointmentRepository, schedulingPolicy, dateTimeService, sendNotificationUseCase);




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
        const getPatientDashboardStatsUseCase = new GetPatientDashboardStatsUseCase(appointmentRepository, patientRepository, calculateProfileCompletionUseCase, dateTimeService);
        const getPatientProfileUseCase = new GetPatientProfileUseCase(patientRepository, calculateProfileCompletionUseCase);
        const getUpcomingAppointmentsUseCase = new GetUpcomingAppointmentsUseCase(appointmentRepository, dateTimeService);
        const updateEmergencyContactUseCase = new UpdateEmergencyContactUseCase(patientRepository);
        const updatePasswordUseCase = new UpdatePasswordUseCase(patientRepository, passwordHasher);
        const updatePatientProfileUseCase = new UpdatePatientProfileUseCase(patientRepository, calculateProfileCompletionUseCase);
        const getWalletBalanceUseCase = new GetWalletBalanceUseCase(walletRepository);
        const topUpWalletUseCase = new TopUpWalletUseCase(razorpayService);
        const verifyWalletTopUpUseCase = new VerifyWalletTopUpUseCase(razorpayService, walletRepository);
        const getPatientFinancialActivityUseCase = new GetPatientFinancialActivityUseCase(prisma);

        // Slot
        const bookSlotUseCase = new BookSlotUseCase(slotRepository, consultationRepository);
        const generateSlotsUseCase = new GenerateSlotsUseCase(slotRepository, doctorRepository, schedulingPolicy);
        const getAvailableSlotCase = new GetAvailableSlotCase(slotRepository, generateSlotsUseCase);

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
        const appointmentController = new AppointmentController(getAvailableSlotCase, bookAppointmentUseCase);
        const notificationController = new NotificationController(
            getNotificationsUseCase, markNotificationAsReadUseCase, 
            getUnreadCountUseCase, deleteNotificationsUseCase
        );
        
        const consultationController = new ConsultationController(
            checkinPatientUseCase, getDoctorQueueUseCase, startConsultationUseCase, 
            completeConsultationUseCase, getPatientHistoryUseCase, getConsultationDetailsUseCase,
            requestLabTestUseCase, uploadLabTestUseCase, getLabTestsUseCase
        );

        const doctorAuthController = new DoctorAuthController(
            loginDoctorUseCase, refreshTokenUseCase, logoutUseCase, forgotPasswordUseCase, resetPasswordUseCase
        );
        
        const doctorProfileController = new DoctorProfileController(
            getDoctorProfileUseCase, updateDoctorProfileUseCase, updateDoctorPasswordUseCase
        );
        
        const doctorAppointmentController = new DoctorAppointmentController(
            getDoctorDashboardStatsUseCase, getDoctorAppointmentsUseCase, 
            updateDoctorSchedulesUseCase, generateSlotsUseCase, rescheduleAppointmentUseCase
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
            cancelAppointmentUseCase, rescheduleAppointmentUseCase
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

        const paymentController = new PaymentController(
            handleRazorpayWebhookUseCase,
            getWalletBalanceUseCase,
            topUpWalletUseCase,
            verifyWalletTopUpUseCase,
            getPatientFinancialActivityUseCase
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
            authMiddleware
        };
    }
}

export const container = CompositionRoot.assemble();
