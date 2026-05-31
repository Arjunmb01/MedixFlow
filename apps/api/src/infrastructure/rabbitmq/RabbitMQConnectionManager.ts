import amqp, { AmqpConnectionManager } from "amqp-connection-manager";

export class RabbitMQConnectionManager {
  private static instance: AmqpConnectionManager;

  public static getConnection(): AmqpConnectionManager {
    if (!this.instance) {
      const url = process.env.RABBITMQ_URL || "amqp://localhost";
      this.instance = amqp.connect([url]);

      this.instance.on("connect", () => {
        console.info("RabbitMQ: Connection established successfully");
      });

      this.instance.on("disconnect", (err) => {
        console.warn("RabbitMQ: Disconnected", err.err);
      });
    }
    return this.instance;
  }
}
