export interface ISessionService {
  saveSession(userId: string, refreshToken: string): Promise<void>;
  getSession(userId: string): Promise<string | null>;
  deleteSession(userId: string): Promise<void>;
  verifySession(userId: string, refreshToken: string): Promise<boolean>;
}
