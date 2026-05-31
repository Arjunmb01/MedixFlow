import type { IRazorpayService } from "@/domain/services/IRazorpayService";
import { RazorpayService } from "./RazorpayService";

let razorpayInstance: IRazorpayService | null = null;

/** Lazily constructs Razorpay SDK client on first payment operation. */
export function getRazorpayService(): IRazorpayService {
  if (!razorpayInstance) {
    razorpayInstance = new RazorpayService();
  }
  return razorpayInstance;
}
