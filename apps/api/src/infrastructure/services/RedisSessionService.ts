import redisClient from "@/infrastructure/services/redisClient";
import { ISessionService } from "@/domain/services/IAuthServices";

export class RedisSessionService implements ISessionService {
  async saveSession(userId: string, refreshToken: string) {
    await redisClient.set(`session:${userId}`, refreshToken, {
      EX: 60 * 60 * 24 * 7
    });
  }

  async getSession(userId: string) {
    return redisClient.get(`session:${userId}`);
  }

  async deleteSession(userId: string) {
    await redisClient.del(`session:${userId}`);
  }

  async verifySession(userId: string, refreshToken: string) {
    const storedToken = await this.getSession(userId);
    return storedToken === refreshToken;
  }
}
