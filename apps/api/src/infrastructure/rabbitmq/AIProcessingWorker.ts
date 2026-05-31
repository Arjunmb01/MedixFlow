import { BaseWorker } from "./BaseWorker";
import { ConsumeMessage } from "amqplib";

export class AIProcessingWorker extends BaseWorker {
  protected queueName = "ai.processing";
  protected exchangeName = "medixflow.events";
  protected routingKey = "ai.#";

  protected async process(data: any, _originalMsg: ConsumeMessage): Promise<void> {
    const { taskType, payload } = data;
    console.info(`AI Worker: Starting task ${taskType} for ${payload.id}`);
    
    // Simulate long-running AI task
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.info(`AI Worker: Completed task ${taskType} for ${payload.id}`);
  }
}
