export interface IPatientRepository {
  findById(id: string): Promise<any>;
  updatePatient(id: string, data: any): Promise<any>;
  updatePassword(id: string, passwordHash: string): Promise<any>;
  replaceEmergencyContacts(patientId: string, contacts: any[]): Promise<any>;
  getPatients(query: { search?: string; status?: string; gender?: string; page: number; limit: number }): Promise<any>;
  toggleBlock(userId: string, status: any): Promise<any>;
  deletePatient(userId: string): Promise<any>;
  getStats(): Promise<any>;
}
