import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class RedisSessionService implements ISessionService {
  constructor(private readonly redisClient: IRedisClient) {}

  private getSessionKey(userId: string, role: UserRole): string {
    return `session:${role.toLowerCase()}:${userId}`;
  }

  async saveSession(userId: string, role: UserRole, refreshToken: string) {
    await this.redisClient.set(this.getSessionKey(userId, role), refreshToken, {
      EX: 60 * 60 * 24 * 7
    });
  }

  async getSession(userId: string, role: UserRole) {
    return this.redisClient.get(this.getSessionKey(userId, role));
  }

  async deleteSession(userId: string, role: UserRole) {
    await this.redisClient.del(this.getSessionKey(userId, role));
  }

  async verifySession(userId: string, role: UserRole, refreshToken: string) {
    const storedToken = await this.getSession(userId, role);
    return storedToken === refreshToken;
  }
}

