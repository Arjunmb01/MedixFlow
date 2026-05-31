"use strict";
jest.mock("@/shared/config/env", () => ({
    env: {
        NODE_ENV: "test",
        PORT: 5000,
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_ACCESS_SECRET: "a".repeat(32),
        JWT_REFRESH_SECRET: "b".repeat(32),
        FRONTEND_URL: "http://localhost:3000",
        ALLOWED_ORIGINS: ["http://localhost:3000"],
        GOOGLE_CLIENT_ID: "google_id",
        RAZORPAY_KEY_ID: "rzp_id",
        RAZORPAY_KEY_SECRET: "rzp_secret",
        RAZORPAY_WEBHOOK_SECRET: "rzp_webhook",
        STRIPE_SECRET_KEY: "sk_test_123",
        STRIPE_WEBHOOK_SECRET: "whsec_123",
        PAYPAL_CLIENT_ID: "pp_id",
        PAYPAL_CLIENT_SECRET: "pp_secret",
        PAYPAL_WEBHOOK_ID: "pp_webhook",
        PAYPAL_MODE: "sandbox",
        smtp: {
            host: "smtp.example.com",
            port: 587,
            user: "user",
            pass: "pass",
            from: "noreply@example.com",
        },
    },
}));
