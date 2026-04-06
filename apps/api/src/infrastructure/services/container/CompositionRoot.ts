import { prisma } from "../../database/prismaClient";
import { config } from "../config";

// Mappers
import { ConsultationMapper } from "../../database/mappers/ConsultationMapper";
import { SchedulingPolicy } from "../../../domain/services/SchedulingPolicy";
import { DoctorMapper } from "../../database/mappers/DoctorMapper";
import { PatientMapper } from "../../database/mappers/PatientMapper";
import { SlotMapper } from "../../database/mappers/SlotMapper";
import { AppointmentMapper } from "../../database/mappers/AppointmentMapper";

// Repositories
import { PatientRepository } from "../../repositories/PatientRepository";
import { DoctorRepository } from "../../repositories/DoctorRepository";
import { StaffRepository } from "../../repositories/StaffRepository";
import { AuthRepository } from "../../repositories/AuthRepository";
import { ConsultationRepository } from "../../repositories/ConsultationRepository";
import { SlotRepository } from "../../repositories/SlotRepository";
import { AppointmentRepository } from "../../repositories/AppointmentRepository";

// Infrastructure Services
import { BcryptPasswordHasher } from "../BcryptPasswordHasher";
import { RedisSessionService } from "../RedisSessionService";
import { EmailOtpService } from "../EmailOtpService";
import { JwtTokenService } from "../JwtTokenService";
import { GoogleAuthService } from "../GoogleAuthService";
import { SmtpEmailService } from "../SmtpEmailService";
import { PatientIdGenerator } from "../PatientIdGenerator";
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

// Controllers
import { AdminAuthController } from "@/presentation/controllers/AdminAuthController";
import { AppointmentController } from "@/presentation/controllers/AppointmentController";
import { ConsultationController } from "@/presentation/controllers/ConsultationController";
import { DoctorAuthController } from "@/presentation/controllers/DoctorAuthController";
import { DoctorController } from "@/presentation/controllers/DoctorController";
import { DoctorSlotController } from "@/presentation/controllers/DoctorSlotController";
import { PatientAuthController } from "@/presentation/controllers/PatientAuthController";
import { PatientController } from "@/presentation/controllers/PatientController";
import { PublicDoctorController } from "@/presentation/controllers/PublicDoctorController";
import { SlotController } from "@/presentation/controllers/SlotController";
import { StaffController } from "@/presentation/controllers/StaffController";
import { createAuthMiddleware } from "@/presentation/controllers/middleware/auth.middleware";

export class CompositionRoot {
    static assemble() {
        // 1. Core Config & Clients
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

        // 2. Mappers
        const consultationMapper = new ConsultationMapper();
        const doctorMapper = new DoctorMapper();
        const patientMapper = new PatientMapper();
        const slotMapper = new SlotMapper();
        const appointmentMapper = new AppointmentMapper();

        // 3. Infrastructure Services
        const passwordHasher = new BcryptPasswordHasher();
        const schedulingPolicy = new SchedulingPolicy();
        const redisSessionService = new RedisSessionService(redisClient);
        const emailService = new SmtpEmailService(smtpConfig);
        const emailOtpService = new EmailOtpService(redisClient, emailService);
        const jwtTokenService = new JwtTokenService(jwtConfig);
        const googleAuthService = new GoogleAuthService();
        const patientIdGenerator = new PatientIdGenerator(prisma);

        // 4. Repositories
        const patientRepository = new PatientRepository(prisma, patientMapper);
        const doctorRepository = new DoctorRepository(prisma, doctorMapper, schedulingPolicy);
        const staffRepository = new StaffRepository(prisma, doctorMapper, passwordHasher);
        const authRepository = new AuthRepository(prisma, patientIdGenerator);
        const slotRepository = new SlotRepository(prisma, slotMapper);
        const consultationRepository = new ConsultationRepository(prisma, consultationMapper);
        const appointmentRepository = new AppointmentRepository(prisma, appointmentMapper);

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
        const getPatientStatsUseCase = new GetPatientStatsUseCase(patientRepository);

        // Appointment
        const bookAppointmentUseCase = new BookAppointmentUseCase(appointmentRepository, schedulingPolicy);
        const cancelAppointmentUseCase = new CancelAppointmentUseCase(appointmentRepository);
        const getAllAppointmentsUseCase = new GetAllAppointmentsUseCase(appointmentRepository);

        // Consultation
        const checkinPatientUseCase = new CheckinPatientUseCase(appointmentRepository, consultationRepository);
        const completeConsultationUseCase = new CompleteConsultationUseCase(consultationRepository, appointmentRepository);
        const getConsultationDetailsUseCase = new GetConsultationDetailsUseCase(consultationRepository);
        const getDoctorQueueUseCase = new GetDoctorQueueUseCase(consultationRepository);
        const getPatientHistoryUseCase = new GetPatientHistoryUseCase(consultationRepository);
        const startConsultationUseCase = new StartConsultationUseCase(consultationRepository);

        // Doctor
        const getAllDoctorsUseCase = new GetAllDoctorsUseCase(doctorRepository);
        const getConsultedPatientsUseCase = new GetConsultedPatientsUseCase(doctorRepository);
        const getDoctorAppointmentsUseCase = new GetDoctorAppointmentsUseCase(appointmentRepository);
        const getDoctorDashboardStatsUseCase = new GetDoctorDashboardStatsUseCase(doctorRepository);
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
        const getUpcomingAppointmentsUseCase = new GetUpcomingAppointmentsUseCase(appointmentRepository);
        const updateEmergencyContactUseCase = new UpdateEmergencyContactUseCase(patientRepository);
        const updatePasswordUseCase = new UpdatePasswordUseCase(patientRepository, passwordHasher);
        const updatePatientProfileUseCase = new UpdatePatientProfileUseCase(patientRepository, calculateProfileCompletionUseCase);

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

        // Middlewares
        const authMiddleware = createAuthMiddleware(jwtTokenService, authRepository);

        // Controllers
        const adminAuthController = new AdminAuthController(loginAdminUseCase, refreshTokenUseCase, logoutUseCase);
        const appointmentController = new AppointmentController(getAvailableSlotCase, bookAppointmentUseCase);
        
        const consultationController = new ConsultationController(
            checkinPatientUseCase, getDoctorQueueUseCase, startConsultationUseCase, 
            completeConsultationUseCase, getPatientHistoryUseCase, getConsultationDetailsUseCase
        );

        const doctorAuthController = new DoctorAuthController(
            loginDoctorUseCase, refreshTokenUseCase, logoutUseCase, forgotPasswordUseCase, resetPasswordUseCase
        );
        
        const doctorController = new DoctorController(
            getDoctorProfileUseCase, updateDoctorProfileUseCase, updateDoctorPasswordUseCase, 
            getDoctorDashboardStatsUseCase, updateDoctorSchedulesUseCase, getDoctorAppointmentsUseCase, 
            generateSlotsUseCase, getConsultedPatientsUseCase, getDoctorPrescriptionsUseCase, updatePrescriptionUseCase
        );
        
        const doctorSlotController = new DoctorSlotController(getAvailableSlotCase);

        const patientAuthController = new PatientAuthController(
            signUpUseCase, verifyOtpUseCase, loginPatientUseCase, googleAuthUseCase, 
            refreshTokenUseCase, logoutUseCase, resendOtpUseCase, forgotPasswordUseCase, resetPasswordUseCase
        );
        
        const patientController = new PatientController(
            updatePatientProfileUseCase, updateEmergencyContactUseCase, getPatientProfileUseCase, 
            updatePasswordUseCase, getAllPatientsUseCase, getPatientByIdUseCase, 
            toggleBlockPatientUseCase, deletePatientUseCase, getPatientStatsUseCase, getUpcomingAppointmentsUseCase, 
            getPatientDashboardStatsUseCase, getPatientAppointmentsUseCase, cancelAppointmentUseCase, getAllAppointmentsUseCase
        );

        const publicDoctorController = new PublicDoctorController(getAllDoctorsUseCase, getPublicDoctorDetailsUseCase);
        
        const slotController = new SlotController(generateSlotsUseCase, getAvailableSlotCase, bookSlotUseCase);
        
        const staffController = new StaffController(
            getDoctorsUseCase, createDoctorUseCase, updateStaffDoctorUseCase, 
            blockDoctorUseCase, deleteDoctorUseCase, setupPasswordUseCase
        );

        return {
            adminAuthController,
            appointmentController,
            consultationController,
            doctorAuthController,
            doctorController,
            doctorSlotController,
            patientAuthController,
            patientController,
            publicDoctorController,
            slotController,
            staffController,
            authMiddleware
        };
    }
}

export const container = CompositionRoot.assemble();
