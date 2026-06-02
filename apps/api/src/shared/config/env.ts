import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/** Trim and strip wrapping quotes (common when pasting into Render/Vercel). */
function normalizeEnvString(val: unknown): unknown {
    if (typeof val !== "string") return val;
    let s = val.trim();
    if (
        (s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))
    ) {
        s = s.slice(1, -1).trim();
    }
    return s;
}

const postgresUrl = z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
        (val) => /^postgres(ql)?:\/\//i.test(val),
        "DATABASE_URL must start with postgres:// or postgresql://"
    );

const redisUrl = z
    .string()
    .refine(
        (val) => val === "" || /^rediss?:\/\//i.test(val),
        "REDIS_URL must start with redis:// or rediss://"
    )
    .optional()
    .transform((val) => (val === "" ? undefined : val));

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
    DATABASE_URL: postgresUrl,
    REDIS_URL: redisUrl,
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    FRONTEND_URL: z.string().transform((val) => val.split(",")),
    GOOGLE_CLIENT_ID: z.string().default(""),
    RAZORPAY_KEY_ID: z.string().default(""),
    RAZORPAY_KEY_SECRET: z.string().default(""),
    RAZORPAY_WEBHOOK_SECRET: z.string().default(""),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default("587").transform((val) => parseInt(val, 10)).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().default(""),
    STRIPE_WEBHOOK_SECRET: z.string().default(""),
    PAYPAL_CLIENT_ID: z.string().default(""),
    PAYPAL_CLIENT_SECRET: z.string().default(""),
    PAYPAL_WEBHOOK_ID: z.string().default(""),
    PAYPAL_MODE: z.enum(["sandbox", "live"]).default("sandbox"),
});

const normalizedEnv = Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key, normalizeEnvString(value)])
);

const _env = envSchema.safeParse(normalizedEnv);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}

const data = _env.data;

export const env = {
    ...data,
    FRONTEND_URL: data.FRONTEND_URL[0],
    ALLOWED_ORIGINS: data.FRONTEND_URL,
    smtp: {
        host: data.SMTP_HOST || "",
        port: data.SMTP_PORT || 587,
        user: data.SMTP_USER || "",
        pass: data.SMTP_PASS || "",
        from: data.SMTP_FROM || ""
    }
};
