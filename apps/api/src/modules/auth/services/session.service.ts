import redisClient from "../../../infrastructure/cache/redisClient";

class SessionService {
    async saveSession(userId : string,refreshToken : string){
        await redisClient.set(
            `session:${userId}`,
            refreshToken,
            {EX: 60 * 60 * 24 * 7}
        )
    }

    async getSession(userId: string) {
        return redisClient.get(`session:${userId}`);
    }

    async deleteSession(userId: string) {
        return redisClient.del(`session:${userId}`)
    }
}

export default new SessionService()