import { Channel, ConsumeMessage } from "amqplib";
import { ChannelWrapper } from "amqp-connection-manager";
import { RabbitMQConnectionManager } from "./RabbitMQConnectionManager";

export abstract class BaseWorker {
  protected abstract queueName: string;
  protected abstract routingKey: string;
  protected abstract exchangeName: string;
  protected channelWrapper: ChannelWrapper;

  constructor() {
    const connection = RabbitMQConnectionManager.getConnection();
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return Promise.all([
          // Main Queue
          channel.assertQueue(this.queueName, { 
            durable: true,
            deadLetterExchange: "medixflow.deadletter",
            deadLetterRoutingKey: this.queueName
          }),
          // Dead Letter Exchange and Queue
          channel.assertExchange("medixflow.deadletter", "direct", { durable: true }),
          channel.assertQueue(`${this.queueName}.dlq`, { durable: true }),
          channel.bindQueue(`${this.queueName}.dlq`, "medixflow.deadletter", this.queueName),
          
          // Bind Main Queue to Exchange
          channel.bindQueue(this.queueName, this.exchangeName, this.routingKey),
          
          // Prefetch for flow control
          channel.prefetch(1),
          
          // Start Consuming
          channel.consume(this.queueName, (msg) => this.onMessage(msg, channel))
        ]);
      }
    });
  }

  private async onMessage(msg: ConsumeMessage | null, channel: Channel) {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());
      await this.process(content, msg);
      channel.ack(msg);
    } catch (error) {
      console.error(`Error processing message in ${this.queueName}:`, error);
      
      // Retry logic: If it's a transient error, we could nack with requeue=true
      // But for production, it's safer to nack with requeue=false so it goes to DLQ
      // and we can manually retry or use a delay exchange.
      channel.nack(msg, false, false);
    }
  }

  protected abstract process(data: any, originalMsg: ConsumeMessage): Promise<void>;
}
