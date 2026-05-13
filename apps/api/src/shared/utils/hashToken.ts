import crypto from "crypto";

/**
 * Hashes a token using SHA-256 for secure storage in the database.
 * This prevents plain-text exposure if the database is compromised.
 */
export const hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
