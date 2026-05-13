import { IQueueProducer } from "@/application/interfaces/IQueueProducer";

export class DomainEventDispatcher {
  constructor(private readonly queueProducer: IQueueProducer) {}

  async dispatch<T>(eventName: string, payload: T): Promise<void> {
    const exchange = "medixflow.events";
    const routingKey = eventName.toLowerCase();

    console.info(`Dispatching event: ${eventName}`);
    
    await this.queueProducer.publish(exchange, routingKey, {
      eventName,
      timestamp: new Date(),
      payload
    });
  }
}
