import { IQueueProducer } from "@/application/interfaces/IQueueProducer";
import { ChannelWrapper } from "amqp-connection-manager";
import { RabbitMQConnectionManager } from "./RabbitMQConnectionManager";

export class RabbitMQProducer implements IQueueProducer {
  private channelWrapper: ChannelWrapper;

  constructor() {
    const connection = RabbitMQConnectionManager.getConnection();
    this.channelWrapper = connection.createChannel({
      json: true,
      setup: (channel: any) => {
        // Basic topology setup can go here if needed
        return Promise.all([
          channel.assertExchange("medixflow.events", "topic", { durable: true }),
          channel.assertExchange("medixflow.notifications", "direct", { durable: true }),
        ]);
      }
    });
  }

  async publish<T>(exchange: string, routingKey: string, message: T, options?: any): Promise<boolean> {
    try {
      await this.channelWrapper.publish(exchange, routingKey, message, options);
      return true;
    } catch (error) {
      console.error(`RabbitMQ: Failed to publish message to ${exchange}`, error);
      return false;
    }
  }

  async sendToQueue<T>(queue: string, message: T, options?: any): Promise<boolean> {
    try {
      await this.channelWrapper.sendToQueue(queue, message, options);
      return true;
    } catch (error) {
      console.error(`RabbitMQ: Failed to send message to queue ${queue}`, error);
      return false;
    }
  }
}
