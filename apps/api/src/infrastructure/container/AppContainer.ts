// New Auth Implementations
import { AuthRepository } from "@/infrastructure/repositories/AuthRepository";
import { EmailOtpService } from "@/infrastructure/services/EmailOtpService";
import { RedisSessionService } from "@/infrastructure/services/RedisSessionService";
import { JwtTokenService } from "@/infrastructure/services/JwtTokenService";
import { GoogleAuthService } from "@/infrastructure/services/GoogleAuthService";

import { PublicDoctorController } from "@/presentation/controllers/PublicDoctorController";
import { GetAllDoctorsUseCase } from "@/application/usecases/doctor/getAllDoctors.usecase";
import { GetPublicDoctorDetailsUseCase } from "@/application/usecases/doctor/getPublicDoctorDetails.usecase";

import { SignUpUseCase } from "@/application/usecases/auth/signup.usecase";
import { VerifyOtpUseCase } from "@/application/usecases/auth/verifyOtp.usecase";
import { LoginPatientUseCase } from "@/application/usecases/auth/loginPatient.usecase";
import { LoginDoctorUseCase } from "@/application/usecases/auth/loginDoctor.usecase";
import { LoginAdminUseCase } from "@/application/usecases/auth/loginAdmin.usecase";
import { RefreshTokenUseCase } from "@/application/usecases/auth/refreshToken.usecase";
import { LogoutUseCase } from "@/application/usecases/auth/logout.usecase";
import { ResendOtpUseCase } from "@/application/usecases/auth/resendOtp.usecase";
import { ForgotPasswordUseCase } from "@/application/usecases/auth/forgotPassword.usecase";
import { ResetPasswordUseCase } from "@/application/usecases/auth/resetPassword.usecase";
import { GoogleAuthUseCase } from "@/application/usecases/auth/googleAuth.usecase";

import { PatientAuthController } from "@/presentation/controllers/PatientAuthController";
import { DoctorAuthController as PatientDoctorAuthController } from "@/presentation/controllers/DoctorAuthController"; // Avoid name conflict
import { AdminAuthController } from "@/presentation/controllers/AdminAuthController";

// New Patient Implementations
import { PatientRepository } from "@/infrastructure/repositories/PatientRepository";
import { UpdatePatientProfileUseCase } from "@/application/usecases/patient/updatePatientProfile.usecase";
import { UpdateEmergencyContactUseCase } from "@/application/usecases/patient/updateEmergencyContact.usecase";
import { CalculateProfileCompletionUseCase } from "@/application/usecases/patient/CalculateProfileCompletionUseCase";
import { GetPatientProfileUseCase } from "@/application/usecases/patient/getPatientProfile.usecase";
import { UpdatePasswordUseCase } from "@/application/usecases/patient/updatePassword.usecase";
import { GetAllPatientsUseCase } from "@/application/usecases/patient/getAllPatients.usecase";
import { GetPatientByIdUseCase } from "@/application/usecases/patient/getPatientById.usecase";
import { ToggleBlockPatientUseCase, DeletePatientUseCase, GetPatientStatsUseCase } from "@/application/usecases/admin/adminActions.usecase";
import { PatientController } from "@/presentation/controllers/PatientController";

// New Staff/Doctor Implementations
import { DoctorRepository } from "@/infrastructure/repositories/DoctorRepository";
import { StaffRepository } from "@/infrastructure/repositories/StaffRepository";
import { GetDoctorProfileUseCase } from "@/application/usecases/doctor/getDoctorProfile.usecase";
import { UpdateDoctorProfileUseCase } from "@/application/usecases/doctor/updateDoctorProfile.usecase";
import { UpdateDoctorPasswordUseCase } from "@/application/usecases/doctor/updateDoctorPassword.usecase";
import { GetDoctorDashboardStatsUseCase } from "@/application/usecases/doctor/getDoctorDashboardStats.usecase";
import { UpdateDoctorSchedulesUseCase } from "@/application/usecases/doctor/updateDoctorSchedules.usecase";
import { GetDoctorsUseCase, CreateDoctorUseCase, UpdateStaffDoctorUseCase, BlockDoctorUseCase, DeleteDoctorUseCase, SetupPasswordUseCase } from "@/application/usecases/staff/staffActions.usecase";
import { DoctorController } from "@/presentation/controllers/DoctorController";
import { StaffController } from "@/presentation/controllers/StaffController";

import emailService from "@/infrastructure/services/SmtpEmailService";
import { IEmailService } from "@/domain/services/IEmailService";

export class AppContainer {
  private static instance: AppContainer;

  // Repositories
  private _patientRepository: PatientRepository;
  private _doctorRepository: DoctorRepository;
  private _staffRepository: StaffRepository;
  private _authRepository: AuthRepository;

  // Services
  private _emailOtpService: EmailOtpService;
  private _redisSessionService: RedisSessionService;
  private _jwtTokenService: JwtTokenService;
  private _googleAuthService: GoogleAuthService;
  private _emailService: IEmailService;

  // Use Cases - Doctor Profile
  private _getDoctorProfileUseCase: GetDoctorProfileUseCase;
  private _updateDoctorProfileUseCase: UpdateDoctorProfileUseCase;
  private _updateDoctorPasswordUseCase: UpdateDoctorPasswordUseCase;
  private _getDoctorDashboardStatsUseCase: GetDoctorDashboardStatsUseCase;
  private _updateDoctorSchedulesUseCase: UpdateDoctorSchedulesUseCase;

  // Use Cases - Patient
  private _calculateProfileCompletionUseCase: CalculateProfileCompletionUseCase;
  private _updatePatientProfileUseCase: UpdatePatientProfileUseCase;
  private _updateEmergencyContactUseCase: UpdateEmergencyContactUseCase;
  private _getPatientProfileUseCase: GetPatientProfileUseCase;
  private _updatePatientPasswordUseCase: UpdatePasswordUseCase;
  private _getAllPatientsUseCase: GetAllPatientsUseCase;
  private _getPatientByIdUseCase: GetPatientByIdUseCase;
  private _toggleBlockPatientUseCase: ToggleBlockPatientUseCase;
  private _deletePatientUseCase: DeletePatientUseCase;
  private _getPatientStatsUseCase: GetPatientStatsUseCase;

  // Use Cases - Staff/Admin
  private _getDoctorsUseCase: GetDoctorsUseCase;
  private _createDoctorUseCase: CreateDoctorUseCase;
  private _updateStaffDoctorUseCase: UpdateStaffDoctorUseCase;
  private _blockDoctorUseCase: BlockDoctorUseCase;
  private _deleteDoctorUseCase: DeleteDoctorUseCase;
  private _setupPasswordUseCase: SetupPasswordUseCase;

  // Use Cases - Auth
  private _signUpUseCase: SignUpUseCase;
  private _verifyOtpUseCase: VerifyOtpUseCase;
  private _loginPatientUseCase: LoginPatientUseCase;
  private _loginDoctorUseCase: LoginDoctorUseCase;
  private _loginAdminUseCase: LoginAdminUseCase;
  private _refreshTokenUseCase: RefreshTokenUseCase;
  private _logoutUseCase: LogoutUseCase;
  private _resendOtpUseCase: ResendOtpUseCase;
  private _forgotPasswordUseCase: ForgotPasswordUseCase;
  private _resetPasswordUseCase: ResetPasswordUseCase;
  private _googleAuthUseCase: GoogleAuthUseCase;


  // Use Cases - Public Doctor
  private _getAllDoctorsUseCase: GetAllDoctorsUseCase;
  private _getPublicDoctorDetailsUseCase: GetPublicDoctorDetailsUseCase;

  // Controllers
  private _doctorController: DoctorController;
  private _patientController: PatientController;
  private _staffController: StaffController;
  private _patientAuthController: PatientAuthController;
  private _doctorAuthController: PatientDoctorAuthController;
  private _adminAuthController: AdminAuthController;
  private _publicDoctorController: PublicDoctorController;

  private constructor() {
    this._patientRepository = new PatientRepository();
    this._doctorRepository = new DoctorRepository();
    this._staffRepository = new StaffRepository();
    this._authRepository = new AuthRepository();

    this._emailOtpService = new EmailOtpService();
    this._redisSessionService = new RedisSessionService();
    this._jwtTokenService = new JwtTokenService();
    this._googleAuthService = new GoogleAuthService();
    this._emailService = emailService;

    // Doctor Use Cases
    this._getDoctorProfileUseCase = new GetDoctorProfileUseCase(this._doctorRepository);
    this._updateDoctorProfileUseCase = new UpdateDoctorProfileUseCase(this._doctorRepository);
    this._updateDoctorPasswordUseCase = new UpdateDoctorPasswordUseCase(this._doctorRepository);
    this._getDoctorDashboardStatsUseCase = new GetDoctorDashboardStatsUseCase(this._doctorRepository);
    this._updateDoctorSchedulesUseCase = new UpdateDoctorSchedulesUseCase(this._doctorRepository);

    // Public Doctor Use Cases
    this._getAllDoctorsUseCase = new GetAllDoctorsUseCase(this._doctorRepository);
    this._getPublicDoctorDetailsUseCase = new GetPublicDoctorDetailsUseCase(this._doctorRepository);

    // Patient Use Cases
    this._calculateProfileCompletionUseCase = new CalculateProfileCompletionUseCase();
    this._updatePatientProfileUseCase = new UpdatePatientProfileUseCase(this._patientRepository, this._calculateProfileCompletionUseCase);
    this._updateEmergencyContactUseCase = new UpdateEmergencyContactUseCase(this._patientRepository);
    this._getPatientProfileUseCase = new GetPatientProfileUseCase(this._patientRepository, this._calculateProfileCompletionUseCase);
    this._updatePatientPasswordUseCase = new UpdatePasswordUseCase(this._patientRepository);
    this._getAllPatientsUseCase = new GetAllPatientsUseCase(this._patientRepository);
    this._getPatientByIdUseCase = new GetPatientByIdUseCase(this._patientRepository);
    this._toggleBlockPatientUseCase = new ToggleBlockPatientUseCase(this._patientRepository, this._redisSessionService);
    this._deletePatientUseCase = new DeletePatientUseCase(this._patientRepository);
    this._getPatientStatsUseCase = new GetPatientStatsUseCase(this._patientRepository);

    // Staff Use Cases
    this._getDoctorsUseCase = new GetDoctorsUseCase(this._staffRepository);
    this._createDoctorUseCase = new CreateDoctorUseCase(this._staffRepository, this._emailService);
    this._updateStaffDoctorUseCase = new UpdateStaffDoctorUseCase(this._staffRepository);
    this._blockDoctorUseCase = new BlockDoctorUseCase(this._staffRepository, this._redisSessionService);
    this._deleteDoctorUseCase = new DeleteDoctorUseCase(this._staffRepository);
    this._setupPasswordUseCase = new SetupPasswordUseCase(this._staffRepository);

    // Auth Use Cases
    this._signUpUseCase = new SignUpUseCase(this._authRepository, this._emailOtpService, this._emailService);
    this._verifyOtpUseCase = new VerifyOtpUseCase(this._authRepository, this._emailOtpService);
    this._loginPatientUseCase = new LoginPatientUseCase(this._authRepository, this._jwtTokenService, this._redisSessionService);
    this._loginDoctorUseCase = new LoginDoctorUseCase(this._authRepository, this._jwtTokenService, this._redisSessionService);
    this._loginAdminUseCase = new LoginAdminUseCase(this._authRepository, this._jwtTokenService, this._redisSessionService);
    this._refreshTokenUseCase = new RefreshTokenUseCase(this._redisSessionService, this._authRepository, this._jwtTokenService);
    this._logoutUseCase = new LogoutUseCase(this._redisSessionService);
    this._resendOtpUseCase = new ResendOtpUseCase(this._authRepository, this._emailOtpService, this._emailService);
    this._forgotPasswordUseCase = new ForgotPasswordUseCase(this._authRepository, this._emailService);
    this._resetPasswordUseCase = new ResetPasswordUseCase(this._authRepository);
    this._googleAuthUseCase = new GoogleAuthUseCase(this._authRepository, this._jwtTokenService, this._redisSessionService, this._googleAuthService);

    this._doctorController = new DoctorController(
      this._getDoctorProfileUseCase,
      this._updateDoctorProfileUseCase,
      this._updateDoctorPasswordUseCase,
      this._getDoctorDashboardStatsUseCase,
      this._updateDoctorSchedulesUseCase
    );

    this._publicDoctorController = new PublicDoctorController(
      this._getAllDoctorsUseCase,
      this._getPublicDoctorDetailsUseCase
    );

    this._patientController = new PatientController(
      this._updatePatientProfileUseCase,
      this._updateEmergencyContactUseCase,
      this._getPatientProfileUseCase,
      this._updatePatientPasswordUseCase,
      this._getAllPatientsUseCase,
      this._getPatientByIdUseCase,
      this._toggleBlockPatientUseCase,
      this._deletePatientUseCase,
      this._getPatientStatsUseCase
    );

    this._staffController = new StaffController(
      this._getDoctorsUseCase,
      this._createDoctorUseCase,
      this._updateStaffDoctorUseCase,
      this._blockDoctorUseCase,
      this._deleteDoctorUseCase,
      this._setupPasswordUseCase
    );

    this._patientAuthController = new PatientAuthController(
      this._signUpUseCase,
      this._verifyOtpUseCase,
      this._loginPatientUseCase,
      this._googleAuthUseCase,
      this._refreshTokenUseCase,
      this._logoutUseCase,
      this._resendOtpUseCase,
      this._forgotPasswordUseCase,
      this._resetPasswordUseCase
    );

    this._doctorAuthController = new PatientDoctorAuthController(
      this._loginDoctorUseCase,
      this._refreshTokenUseCase,
      this._logoutUseCase,
      this._forgotPasswordUseCase,
      this._resetPasswordUseCase
    );

    this._adminAuthController = new AdminAuthController(
      this._loginAdminUseCase,
      this._refreshTokenUseCase,
      this._logoutUseCase
    );
  }

  public static getInstance(): AppContainer {
    if (!AppContainer.instance) {
      AppContainer.instance = new AppContainer();
    }
    return AppContainer.instance;
  }

  get patientRepository() { return this._patientRepository; }
  get doctorRepository() { return this._doctorRepository; }
  get staffRepository() { return this._staffRepository; }
  get authRepository() { return this._authRepository; }

  get doctorController() { return this._doctorController; }
  get publicDoctorController() { return this._publicDoctorController; }
  get patientController() { return this._patientController; }
  get staffController() { return this._staffController; }
  get patientAuthController() { return this._patientAuthController; }
  get doctorAuthController() { return this._doctorAuthController; }
  get adminAuthController() { return this._adminAuthController; }
}

export const container = AppContainer.getInstance();
