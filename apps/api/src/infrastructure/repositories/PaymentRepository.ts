import { PrismaClient } from "@prisma/client";
import { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";
import { Payment } from "../../domain/entities/Payment";
import { PaymentMapper } from "../database/mappers/PaymentMapper";
import { CreatePaymentInput } from "../../domain/value-objects/types/payment.types";
import { PaymentStatus } from "../../domain/value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../../domain/value-objects/enums/PaymentMethod";

export class PaymentRepository implements IPaymentRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreatePaymentInput): Promise<Payment> {
        const payment = await this.prisma.payment.create({
            data: {
                appointmentId: data.appointmentId,
                patientId: data.patientId,
                amount: data.amount,
                currency: data.currency,
                razorpayOrderId: data.razorpayOrderId,
                paymentMethod: data.paymentMethod || PaymentMethod.RAZORPAY,
                status: data.status || PaymentStatus.PENDING,
            }
        });
        return PaymentMapper.toDomain(payment);
    }

    async findByOrderId(orderId: string): Promise<Payment | null> {
        const payment = await this.prisma.payment.findUnique({
            where: { razorpayOrderId: orderId }
        });
        if (!payment) return null;
        return PaymentMapper.toDomain(payment);
    }

    async findByAppointmentId(appointmentId: string): Promise<Payment | null> {
        const payment = await this.prisma.payment.findUnique({
            where: { appointmentId }
        });
        if (!payment) return null;
        return PaymentMapper.toDomain(payment);
    }

    async updateStatus(id: string, status: PaymentStatus, razorpayPaymentId?: string, razorpaySignature?: string): Promise<Payment> {
        const payment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: status as any,
                ...(razorpayPaymentId && { razorpayPaymentId }),
                ...(razorpaySignature && { razorpaySignature }),
            }
        });
        return PaymentMapper.toDomain(payment);
    }

    async findByPatientId(patientId: string): Promise<Payment[]> {
        const payments = await this.prisma.payment.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: { appointment: { include: { doctor: true } } }
        });
        
        return payments.map(PaymentMapper.toDomain);
    }

    async findAll(filters?: { status?: PaymentStatus }): Promise<Payment[]> {
        const payments = await this.prisma.payment.findMany({
            where: {
                ...(filters?.status && { status: filters.status })
            },
            orderBy: { createdAt: 'desc' }
        });
        return payments.map(PaymentMapper.toDomain);
    }
}
