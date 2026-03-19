import redisClient from "../../../infrastructure/cache/redisClient";
import { ISessionService } from "../interfaces/ISessionService";

export class SessionService implements ISessionService {
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

export default new SessionService();