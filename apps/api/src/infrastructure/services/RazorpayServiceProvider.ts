import type { IRazorpayService } from "@/domain/services/IRazorpayService";
import { isRazorpayEnabled } from "@/shared/config/payments";
import { RazorpayNotConfiguredError } from "@/shared/errors/RazorpayNotConfiguredError";
import { RazorpayService } from "./RazorpayService";

let razorpayInstance: IRazorpayService | null = null;

/** Returns Razorpay client when KEY_ID and KEY_SECRET are set; otherwise null. */
export function getRazorpayService(): IRazorpayService | null {
  if (!isRazorpayEnabled()) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new RazorpayService();
  }
  return razorpayInstance;
}

export function requireRazorpayService(): IRazorpayService {
  const service = getRazorpayService();
  if (!service) {
    throw new RazorpayNotConfiguredError();
  }
  return service;
}
