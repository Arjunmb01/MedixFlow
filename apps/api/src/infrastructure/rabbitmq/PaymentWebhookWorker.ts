import { BaseWorker } from "./BaseWorker";
import { IdempotencyService } from "@/application/services/IdempotencyService";
import { ConsumeMessage } from "amqplib";

export class PaymentWebhookWorker extends BaseWorker {
  protected queueName = "payments.webhooks";
  protected exchangeName = "medixflow.events";
  protected routingKey = "payment.webhook.#";

  constructor(private readonly idempotencyService: IdempotencyService) {
    super();
  }

  protected async process(data: any, _originalMsg: ConsumeMessage): Promise<void> {
    const { provider, eventId, payload } = data;
    const idempotencyKey = `${provider}:${eventId}`;

    const canProcess = await this.idempotencyService.tryProcess(idempotencyKey);
    if (!canProcess) {
      console.info(`PaymentWebhookWorker: Duplicate event ${idempotencyKey} ignored.`);
      return;
    }

    try {
      console.info(`PaymentWebhookWorker: Processing ${provider} event ${eventId}`);
      
      // Actual processing logic here
      // e.g. update order status, send confirmation email
      
      await this.idempotencyService.complete(idempotencyKey, { success: true });
    } catch (error) {
      await this.idempotencyService.fail(idempotencyKey);
      throw error; // Rethrow to trigger worker retry/DLQ
    }
  }
}
