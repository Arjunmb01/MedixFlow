import { env } from "./env";

export function isRazorpayEnabled(): boolean {
    return Boolean(env.RAZORPAY_KEY_ID?.trim() && env.RAZORPAY_KEY_SECRET?.trim());
}

export function isStripeEnabled(): boolean {
    return Boolean(env.STRIPE_SECRET_KEY?.trim());
}

export function isPayPalEnabled(): boolean {
    return Boolean(env.PAYPAL_CLIENT_ID?.trim() && env.PAYPAL_CLIENT_SECRET?.trim());
}

export function getPublicPaymentConfig() {
    return {
        razorpay: isRazorpayEnabled(),
        stripe: isStripeEnabled(),
        paypal: isPayPalEnabled(),
    };
}
