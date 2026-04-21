import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const paymentController = container.paymentController;

// Webhook is publicly accessible but verified internally by Razorpay signature
router.post(
  "/webhook",
  paymentController.handleWebhook.bind(paymentController)
);

export default router;
