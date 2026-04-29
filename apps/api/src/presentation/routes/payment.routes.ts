import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

const auth = container.authMiddleware;

const router = Router();
const paymentController = container.paymentController;

// Webhook is publicly accessible but verified internally by Razorpay signature
// Razorpay Webhook
router.post(
  "/webhook",
  paymentController.handleWebhook.bind(paymentController)
);

// Stripe Webhook
router.post(
  "/webhook/stripe",
  paymentController.handleStripeWebhook.bind(paymentController)
);

router.post(
  "/webhook/paypal",
  paymentController.handlePayPalWebhook.bind(paymentController)
);

// Protected routes
router.use(auth.authenticate);

router.post(
    "/simulate",
    paymentController.simulatePayment.bind(paymentController)
);

router.post(
    "/retry",
    paymentController.retryPayment.bind(paymentController)
);

router.get(
    "/verify/stripe/:sessionId",
    paymentController.verifyStripePayment.bind(paymentController)
);

router.get(
    "/verify/paypal/:orderId",
    paymentController.verifyPayPalPayment.bind(paymentController)
);

router.post(
    "/verify/razorpay",
    paymentController.verifyRazorpayPayment.bind(paymentController)
);

export default router;
