import { IQueueService, QueueItem } from "../../domain/services/IQueueService";
import redisClient from "./redisClient";

export class RedisQueueService implements IQueueService {
  private getQueueKey(doctorId: string, date: Date): string {
    const dateStr = date.toISOString().split("T")[0];
    return `doctor:queue:${doctorId}:${dateStr}`;
  }

  private getCounterKey(doctorId: string, date: Date): string {
    const dateStr = date.toISOString().split("T")[0];
    return `doctor:queue:counter:${doctorId}:${dateStr}`;
  }

  async addToQueue(doctorId: string, date: Date, appointmentId: string): Promise<number> {
    const counterKey = this.getCounterKey(doctorId, date);
    const queueKey = this.getQueueKey(doctorId, date);

    // Increment counter to get next queue number
    const queueNumber = await redisClient.incr(counterKey);

    // Add to sorted set with queueNumber as score
    await redisClient.zAdd(queueKey, {
      score: queueNumber,
      value: appointmentId,
    });

    // Set expiry for keys (24 hours)
    await redisClient.expire(counterKey, 86400);
    await redisClient.expire(queueKey, 86400);

    return queueNumber;
  }

  async removeFromQueue(doctorId: string, date: Date, appointmentId: string): Promise<void> {
    const queueKey = this.getQueueKey(doctorId, date);
    await redisClient.zRem(queueKey, appointmentId);
  }

  async getQueue(doctorId: string, date: Date): Promise<QueueItem[]> {
    const queueKey = this.getQueueKey(doctorId, date);
    const items = await redisClient.zRangeWithScores(queueKey, 0, -1);

    return items.map((item) => ({
      appointmentId: item.value,
      queueNumber: item.score,
    }));
  }

  async updatePosition(
    doctorId: string,
    date: Date,
    appointmentId: string,
    newPosition: number
  ): Promise<void> {
    const queueKey = this.getQueueKey(doctorId, date);
    await redisClient.zAdd(queueKey, {
      score: newPosition,
      value: appointmentId,
    });
  }

  async getNext(doctorId: string, date: Date): Promise<QueueItem | null> {
    const queueKey = this.getQueueKey(doctorId, date);
    const items = await redisClient.zRangeWithScores(queueKey, 0, 0);

    if (items.length === 0) return null;

    return {
      appointmentId: items[0].value,
      queueNumber: items[0].score,
    };
  }

  async clearQueue(doctorId: string, date: Date): Promise<void> {
    const queueKey = this.getQueueKey(doctorId, date);
    const counterKey = this.getCounterKey(doctorId, date);
    await redisClient.del([queueKey, counterKey]);
  }
}
