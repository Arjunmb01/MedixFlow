import { PrismaClient } from "@prisma/client";

export interface UnifiedActivity {
    id: string;
    amount: number;
    type: "TOP_UP" | "PAYMENT" | "REFUND";
    status: "SUCCESS" | "PENDING" | "FAILED";
    method: "WALLET" | "RAZORPAY";
    createdAt: Date;
    description: string;
    referenceId?: string;
}

export class GetPatientFinancialActivityUseCase {
    constructor(private readonly prisma: PrismaClient) {}

    async execute(patientId: string): Promise<UnifiedActivity[]> {
        console.log(`[GetPatientFinancialActivityUseCase] Fetching activity for patient: ${patientId}`);

        // 1. Fetch Wallet Transactions
        const wallet = await this.prisma.wallet.findUnique({
            where: { patientId },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        // 2. Fetch Direct Payments (Razorpay)
        const payments = await this.prisma.payment.findMany({
            where: { 
                patientId,
                paymentMethod: "RAZORPAY"
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

        // Map Wallet Transactions
        if (wallet) {
            wallet.transactions.forEach(tx => {
                let status: "SUCCESS" | "PENDING" | "FAILED" = "PENDING";
                if (tx.status === "COMPLETED" || (tx.status as string) === "SUCCESS") status = "SUCCESS";
                if (tx.status === "FAILED") status = "FAILED";

                activity.push({
                    id: tx.id,
                    amount: Math.abs(tx.amount),
                    type: tx.type as any,
                    status,
                    method: "WALLET",
                    createdAt: tx.createdAt,
                    description: tx.reason || (tx.type === "TOP_UP" ? "Wallet Top Up" : "Appointment Payment"),
                    referenceId: tx.id
                });
            });
        }

        // Map Direct Payments
        payments.forEach(p => {
            let status: "SUCCESS" | "PENDING" | "FAILED" = "PENDING";
            if (p.status === "PAID" || (p.status as string) === "SUCCESS") status = "SUCCESS";
            if (p.status === "FAILED") status = "FAILED";

            const doctorName = p.appointment?.doctor 
                ? `Dr. ${p.appointment.doctor.firstName} ${p.appointment.doctor.lastName}`
                : "Medical Consultant";

            activity.push({
                id: p.id,
                amount: p.amount,
                type: "PAYMENT",
                status,
                method: "RAZORPAY",
                createdAt: p.createdAt,
                description: `Consultation with ${doctorName}`,
                referenceId: p.razorpayPaymentId || p.razorpayOrderId || p.id
            });
        });

        // Sort by date descending
        const result = activity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        console.log(`[GetPatientFinancialActivityUseCase] Returning ${result.length} unified activity records`);
        return result;
    }
}
