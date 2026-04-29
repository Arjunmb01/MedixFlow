import { Payment as PrismaPayment } from "@prisma/client";
import { Payment } from "../../../domain/entities/Payment";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";

export class PaymentMapper {
    public static toDomain(prismaPayment: PrismaPayment): Payment {
        return new Payment(
            prismaPayment.id,
            prismaPayment.appointmentId,
            prismaPayment.patientId,
            prismaPayment.amount,
            prismaPayment.currency,
            prismaPayment.razorpayOrderId,
            prismaPayment.razorpayPaymentId,
            prismaPayment.razorpaySignature,
            prismaPayment.stripeSessionId,
            prismaPayment.stripePaymentIntentId,
            prismaPayment.paypalOrderId,
            prismaPayment.paypalCaptureId,
            prismaPayment.paymentMethod as PaymentMethod,
            prismaPayment.status as PaymentStatus,
            prismaPayment.walletAmount,
            prismaPayment.createdAt,
            prismaPayment.updatedAt
        );
    }
}
