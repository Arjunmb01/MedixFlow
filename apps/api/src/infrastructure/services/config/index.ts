import dotenv from "dotenv"
dotenv.config()

const frontendUrlRaw = process.env.FRONTEND_URL || "http://localhost:5173";

export const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5000", 10),
    jwtSecret: process.env.JWT_SECRET || "fallback_secret",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "access_secret",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    resendApiKey: process.env.RESEND_API_KEY || "",
    frontendUrl: frontendUrlRaw.split(",")[0],
    allowedOrigins: frontendUrlRaw.split(","),
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    mongoUri: process.env.DATABASE_URL || "",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
    smtp: {
        host: process.env.SMTP_HOST || "",
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.SMTP_FROM || ""
    },
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ""
}
