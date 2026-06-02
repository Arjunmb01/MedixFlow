import api from "@/core/api/axios";

export type PaymentProvidersConfig = {
    razorpay: boolean;
    stripe: boolean;
    paypal: boolean;
};

export async function getPaymentProvidersConfig(): Promise<PaymentProvidersConfig> {
    const { data } = await api.get<{ payments: PaymentProvidersConfig }>("/common/config");
    return data.payments;
}
