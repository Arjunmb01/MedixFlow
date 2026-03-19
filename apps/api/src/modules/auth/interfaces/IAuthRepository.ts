export interface IAuthRepository {
  findUserByEmail(email: string): Promise<any>;
  createPatient(data: any): Promise<any>;
  createGooglePatient(data: any): Promise<any>;
  activateUser(email: string): Promise<any>;
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<any>;
  findPasswordResetToken(token: string): Promise<any>;
  deletePasswordResetToken(token: string): Promise<any>;
  updateUserPassword(userId: string, passwordHash: string): Promise<any>;
  findPatientProfileByUserId(userId: string): Promise<any>;
  findDoctorProfileByUserId(userId: string): Promise<any>;
  findUserById(userId: string): Promise<any>;
}
