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
                stripeSessionId: data.stripeSessionId,
                paypalOrderId: data.paypalOrderId,
                walletAmount: data.walletAmount || 0,
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

    async findByStripeSessionId(sessionId: string): Promise<Payment | null> {
        const payment = await this.prisma.payment.findUnique({
            where: { stripeSessionId: sessionId }
        });
        if (!payment) return null;
        return PaymentMapper.toDomain(payment);
    }

    async findByPayPalOrderId(orderId: string): Promise<Payment | null> {
        const payment = await this.prisma.payment.findUnique({
            where: { paypalOrderId: orderId }
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

    async updateStatus(id: string, status: PaymentStatus, gatewayData?: {
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        stripePaymentIntentId?: string;
        stripeSessionId?: string;
        paypalOrderId?: string;
        paypalCaptureId?: string;
    }): Promise<Payment> {
        const payment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: status as any,
                ...(gatewayData?.razorpayPaymentId && { razorpayPaymentId: gatewayData.razorpayPaymentId }),
                ...(gatewayData?.razorpaySignature && { razorpaySignature: gatewayData.razorpaySignature }),
                ...(gatewayData?.stripePaymentIntentId && { stripePaymentIntentId: gatewayData.stripePaymentIntentId }),
                ...(gatewayData?.stripeSessionId && { stripeSessionId: gatewayData.stripeSessionId }),
                ...(gatewayData?.paypalOrderId && { paypalOrderId: gatewayData.paypalOrderId }),
                ...(gatewayData?.paypalCaptureId && { paypalCaptureId: gatewayData.paypalCaptureId }),
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

    async findAll(filters?: { status?: PaymentStatus; paymentMethod?: PaymentMethod; page?: number; limit?: number; search?: string }): Promise<{ payments: any[]; total: number }> {
        const { status, paymentMethod, page = 1, limit = 10, search } = filters || {};
        const skip = (page - 1) * limit;

        const where: any = {
            ...(status && { status: status as any }),
            ...(paymentMethod && { paymentMethod: paymentMethod as any })
        };

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { patientId: { contains: search, mode: 'insensitive' } } },
                { id: { contains: search, mode: 'insensitive' } },
                { razorpayOrderId: { contains: search, mode: 'insensitive' } },
                { stripeSessionId: { contains: search, mode: 'insensitive' } },
                { paypalOrderId: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: { 
                    patient: true,
                    appointment: { 
                        include: { 
                            doctor: {
                                include: {
                                    specialization: true
                                }
                            } 
                        } 
                    } 
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.payment.count({ where })
        ]);

        // We return the raw prisma objects (which include relations) but we can still map the base payment fields if needed.
        // For admin list, it's often better to just return the enriched object.
        return {
            payments: payments.map(p => ({
                ...PaymentMapper.toDomain(p),
                patient: p.patient,
                doctor: p.appointment?.doctor
            })),
            total
        };
    }
}
