export enum StatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export const MESSAGES = {
    // Auth
    LOGIN_SUCCESS: "Login successful",
    LOGIN_FAILED: "Invalid credentials",
    ACCOUNT_BLOCKED: "Your account has been blocked by the administrator. Please contact support.",
    INVALID_ROLE_ADMIN: "Invalid admin login",
    INVALID_ROLE_PATIENT: "Invalid Patient Login",
    INVALID_ROLE_DOCTOR: "Invalid Doctor login",
    USER_NOT_FOUND: "User not found",
    LOGOUT_SUCCESS: "Logout successful",
    LOGOUT_FAILED: "Logout failed",
    USER_ID_REQUIRED: "User ID required",
    
    // OTP & Password
    OTP_SENT: "OTP sent. Please verify to complete registration.",
    OTP_RESENT: "OTP resent successfully",
    OTP_EXPIRED: "Registration session has expired. Please sign up again.",
    ALREADY_REGISTERED: "User is already registered and verified",
    OTP_VERIFIED: "Account verified and created successfully",
    EMAIL_ALREADY_EXISTS: "Email already exists",
    USER_ALREADY_EXISTS: "A user with this email already exists",
    PASSWORD_RESET_SUCCESS: "Password updated successfully",
    PASSWORD_RESET_FAILED: "Failed to reset password",
    INVALID_RESET_TOKEN: "Invalid or expired reset token",
    INVALID_SETUP_TOKEN: "Invalid setup token",
    SETUP_TOKEN_EXPIRED: "Setup token has expired",
    PASSWORD_REQUIRED: "Password is required",
    TOKEN_PASSWORD_REQUIRED: "Token and password are required",
    PASSWORD_SETUP_SUCCESS: "Password setup successful",
    CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
    NEW_PASSWORD_LENGTH: "New password must be at least 8 characters",
    CURRENT_NEW_PASSWORD_REQUIRED: "Current password and new password are required",
    INVALID_CURRENT_PASSWORD: "Invalid current password",

    // Staff
    STAFF_CREATED: "Doctor created successfully and credentials sent to email",
    STAFF_UPDATED: "Doctor updated successfully",
    STAFF_STATUS_UPDATED: "Doctor status updated successfully",
    STAFF_DELETED: "Doctor deleted successfully",
    STAFF_NOT_FOUND: "Staff member not found",
    NOT_A_DOCTOR: "Staff member is not a doctor",
    
    // Doctor
    DOCTOR_PROFILE_NOT_FOUND: "Doctor profile not found",
    DOCTOR_NOT_FOUND: "Doctor not found",
    PROFILE_UPDATED: "Profile updated successfully",
    SCHEDULE_UPDATED: "Schedules updated successfully",
    
    // Patient
    PATIENT_NOT_FOUND: "Patient not found",
    PATIENT_PROFILE_UPDATED: "Profile updated successfully",
    EMERGENCY_CONTACT_UPDATED: "Emergency contacts updated successfully",
    PATIENT_STATUS_UPDATED: "Patient status updated successfully",
    PATIENT_DELETED: "Patient deleted successfully",
    
    // Uploads
    NO_FILE_UPLOADED: "No file uploaded",
    UPLOAD_FAILED: "Failed to upload file",
    INVALID_FILE_TYPE: "Only JPEG, PNG and WEBP file types are allowed",
    
    // Server
    INTERNAL_ERROR: "Internal Server Error",
    
    // Additional messages
    FORGOT_PASSWORD_CONFIRM: "If an account with that email exists, we have sent a password reset link.",
    EMAIL_REQUIRED: "Email is required",
    GOOGLE_ID_TOKEN_REQUIRED: "Google ID token is required",
    TERMS_ACCEPTED_REQUIRED: "You must accept the terms",
    INVALID_GOOGLE_TOKEN: "Invalid Google token",
    REFRESH_TOKEN_REQUIRED: "Refresh token required",
    INVALID_ROLE_SESSION: "Invalid session for this role",
    SESSION_EXPIRED: "Session expired",
    INVALID_REFRESH_TOKEN: "Invalid refresh token",
    INVALID_OTP: "Invalid OTP",
    OTP_EXPIRED_SIMPLE: "OTP expired",
    APPOINTMENT_CANCELLED: "Appointment cancelled successfully",
    APPOINTMENT_NOT_FOUND: "Appointment not found"
};