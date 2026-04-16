import { PaymentStatus } from "../value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../value-objects/enums/PaymentMethod";

export type PaymentId = string;
export type AppointmentId = string;
export type PatientId = string;

export class Payment {
  constructor(
    public readonly id: PaymentId,
    public readonly appointmentId: AppointmentId,
    public readonly patientId: PatientId,
    public readonly amount: number,
    public readonly currency: string,
    public readonly razorpayOrderId: string | null,
    public readonly razorpayPaymentId: string | null,
    public readonly razorpaySignature: string | null,
    public readonly paymentMethod: PaymentMethod,
    public readonly status: PaymentStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public isPaid(): boolean {
    return this.status === PaymentStatus.PAID;
  }
}
