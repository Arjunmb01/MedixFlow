import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";
import { ISessionService } from "@/application/interfaces/IAuthServices";

export class RedisSessionService implements ISessionService {
  constructor(private readonly redisClient: IRedisClient) {}

  async saveSession(userId: string, refreshToken: string) {
    await this.redisClient.set(`session:${userId}`, refreshToken, {
      EX: 60 * 60 * 24 * 7
    });
  }

  async getSession(userId: string) {
    return this.redisClient.get(`session:${userId}`);
  }

  async deleteSession(userId: string) {
    await this.redisClient.del(`session:${userId}`);
  }

  async verifySession(userId: string, refreshToken: string) {
    const storedToken = await this.getSession(userId);
    return storedToken === refreshToken;
  }
}

