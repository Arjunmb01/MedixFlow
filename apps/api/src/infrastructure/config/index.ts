import dotenv from "dotenv"
dotenv.config()

export const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5000", 10),
    jwtSecret: process.env.JWT_SECRET || "fallback_secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    resendApiKey: process.env.RESEND_API_KEY || "",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    mongoUri: process.env.DATABASE_URL || "",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
}
