import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class RedisSessionService implements ISessionService {
  private readonly TTL = 60 * 60 * 24 * 7; // 7 days

  constructor(private readonly redisClient: IRedisClient) {}

  private getSessionKey(userId: string, role: UserRole, sessionId: string): string {
    return `session:${role.toLowerCase()}:${userId}:${sessionId}`;
  }

  private getUserSessionsSetKey(userId: string, role: UserRole): string {
    return `user_sessions:${role.toLowerCase()}:${userId}`;
  }

  async saveSession(userId: string, role: UserRole, refreshToken: string, sessionId: string) {
    const sessionKey = this.getSessionKey(userId, role, sessionId);
    const userSessionsKey = this.getUserSessionsSetKey(userId, role);

    await Promise.all([
      this.redisClient.set(sessionKey, refreshToken, { EX: this.TTL }),
      this.redisClient.sAdd(userSessionsKey, sessionId),
    ]);
    
    // Set expiry on the set as well to cleanup eventually
    await this.redisClient.expire(userSessionsKey, this.TTL + 3600);
  }

  async getSession(userId: string, role: UserRole, sessionId: string) {
    return this.redisClient.get(this.getSessionKey(userId, role, sessionId));
  }

  async deleteSession(userId: string, role: UserRole, sessionId: string) {
    const sessionKey = this.getSessionKey(userId, role, sessionId);
    const userSessionsKey = this.getUserSessionsSetKey(userId, role);

    await Promise.all([
      this.redisClient.del(sessionKey),
      this.redisClient.sRem(userSessionsKey, sessionId),
    ]);
  }

  async deleteAllSessions(userId: string, role: UserRole) {
    const userSessionsKey = this.getUserSessionsSetKey(userId, role);
    const sessionIds = await this.redisClient.sMembers(userSessionsKey);

    const deletePromises = sessionIds.map(sessionId => 
      this.redisClient.del(this.getSessionKey(userId, role, sessionId))
    );

    await Promise.all([
      ...deletePromises,
      this.redisClient.del(userSessionsKey)
    ]);
  }

  async verifySession(userId: string, role: UserRole, sessionId: string, refreshToken: string) {
    const storedToken = await this.getSession(userId, role, sessionId);
    return storedToken === refreshToken;
  }
}

