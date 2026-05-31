import { PrismaClient } from "@prisma/client";

export interface UnifiedActivity {
    id: string;
    amount: number;
    type: "TOP_UP" | "PAYMENT" | "REFUND";
    status: "PAID" | "PENDING" | "FAILED";
    method: string;
    createdAt: Date;
    description: string;
    referenceId?: string;
    appointmentId?: string;
    appointmentStatus?: string;
}

export class GetPatientFinancialActivityUseCase {
    constructor(private readonly prisma: PrismaClient) {}

    async execute(patientId: string, filters: { page?: number; limit?: number; search?: string; status?: string; startDate?: string; endDate?: string; method?: string; sortBy?: string; sortOrder?: string } = {}): Promise<{ data: UnifiedActivity[], meta: { total: number, page: number, limit: number, totalPages: number } }> {
        const { page = 1, limit = 10, search, status: statusFilter, startDate, endDate, method: methodFilter } = filters;

        const wallet = await this.prisma.wallet.findUnique({
            where: { patientId },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        const payments = await this.prisma.payment.findMany({
            where: { 
                patientId,
                paymentMethod: { in: ["RAZORPAY", "STRIPE", "PAYPAL"] }
            },
            include: {
                appointment: {
                    include: {
                        doctor: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const activity: UnifiedActivity[] = [];
        const startDateTime = startDate ? new Date(startDate) : null;
        if (startDateTime) startDateTime.setHours(0, 0, 0, 0);
        
        const endDateTime = endDate ? new Date(endDate) : null;
        if (endDateTime) endDateTime.setHours(23, 59, 59, 999);

        if (wallet) {
            wallet.transactions.forEach(tx => {
                let status: "PAID" | "PENDING" | "FAILED" = "PENDING";
                if (tx.status === "COMPLETED" || (tx.status as string) === "SUCCESS" || (tx.status as string) === "PAID") status = "PAID";
                if (tx.status === "FAILED") status = "FAILED";

                const description = tx.reason || (tx.type === "TOP_UP" ? "Wallet Top Up" : "Appointment Payment");

                if (statusFilter && status !== statusFilter) return;
                if (search && !description.toLowerCase().includes(search.toLowerCase()) && !tx.id.toLowerCase().includes(search.toLowerCase())) return;
                if (methodFilter && methodFilter !== "WALLET") return;
                if (startDateTime && tx.createdAt < startDateTime) return;
                if (endDateTime && tx.createdAt > endDateTime) return;

                activity.push({
                    id: tx.id,
                    amount: Math.abs(tx.amount),
                    type: tx.type as any,
                    status,
                    method: "WALLET",
                    createdAt: tx.createdAt,
                    description,
                    referenceId: tx.id
                });
            });
        }

        payments.forEach(p => {
            let status: "PAID" | "PENDING" | "FAILED" = "PENDING";
            if (p.status === "PAID" || (p.status as string) === "SUCCESS") status = "PAID";
            if (p.status === "FAILED") status = "FAILED";

            const doctorName = p.appointment?.doctor 
                ? `Dr. ${p.appointment.doctor.firstName} ${p.appointment.doctor.lastName}`
                : "Medical Consultant";
            
            const description = `Consultation with ${doctorName}`;

            // Apply filters
            if (statusFilter && status !== statusFilter) return;
            if (search && !description.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return;
            if (methodFilter && methodFilter !== p.paymentMethod) return;
            if (startDateTime && p.createdAt < startDateTime) return;
            if (endDateTime && p.createdAt > endDateTime) return;

            activity.push({
                id: p.id,
                amount: p.amount,
                type: "PAYMENT",
                status,
                method: p.paymentMethod as any,
                createdAt: p.createdAt,
                description,
                referenceId: p.stripeSessionId || p.razorpayPaymentId || p.razorpayOrderId || p.id,
                appointmentId: p.appointmentId,
                appointmentStatus: p.appointment?.status
            });
        });

        const sorted = activity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const total = sorted.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const data = sorted.slice(start, start + limit);

        const meta = {
            total,
            page,
            limit,
            totalPages
        };

        return { data, meta };
    }
}
