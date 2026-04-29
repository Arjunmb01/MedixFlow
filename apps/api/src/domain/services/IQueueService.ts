export interface QueueItem {
  appointmentId: string;
  queueNumber: number;
}

export interface IQueueService {
  /**
   * Adds an appointment to the doctor's queue for a specific date.
   * Returns the assigned queue number.
   */
  addToQueue(doctorId: string, date: Date, appointmentId: string): Promise<number>;

  /**
   * Removes an appointment from the queue.
   */
  removeFromQueue(doctorId: string, date: Date, appointmentId: string): Promise<void>;

  /**
   * Gets the current queue for a doctor on a specific date.
   */
  getQueue(doctorId: string, date: Date): Promise<QueueItem[]>;

  /**
   * Updates an appointment's position in the queue.
   */
  updatePosition(doctorId: string, date: Date, appointmentId: string, newPosition: number): Promise<void>;

  /**
   * Gets the next appointment in the queue.
   */
  getNext(doctorId: string, date: Date): Promise<QueueItem | null>;

  /**
   * Clears the queue for a doctor on a specific date.
   */
  clearQueue(doctorId: string, date: Date): Promise<void>;
}
