import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createPaymentRoutes(): Router {
  const { paymentController, authMiddleware: auth } = getContainer();
  const router = Router();

  router.post("/webhook", paymentController.handleWebhook.bind(paymentController));
  router.post("/webhook/stripe", paymentController.handleStripeWebhook.bind(paymentController));
  router.post("/webhook/paypal", paymentController.handlePayPalWebhook.bind(paymentController));

  router.use(auth.authenticatePatient);
  router.post("/simulate", paymentController.simulatePayment.bind(paymentController));
  router.post("/retry", paymentController.retryPayment.bind(paymentController));
  router.get("/verify/stripe/:sessionId", paymentController.verifyStripePayment.bind(paymentController));
  router.get("/verify/paypal/:orderId", paymentController.verifyPayPalPayment.bind(paymentController));
  router.post("/verify/razorpay", paymentController.verifyRazorpayPayment.bind(paymentController));

  return router;
}
