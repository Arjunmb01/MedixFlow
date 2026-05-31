export interface IQueueProducer {
  publish<T>(exchange: string, routingKey: string, message: T, options?: any): Promise<boolean>;
  sendToQueue<T>(queue: string, message: T, options?: any): Promise<boolean>;
}
