import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createWalletRoutes(): Router {
  const { paymentController, authMiddleware: auth } = getContainer();
  const router = Router();

  router.use(auth.authenticatePatient);
  router.get("/", paymentController.getWalletBalance.bind(paymentController));
  router.post("/top-up", paymentController.topUpWallet.bind(paymentController));
  router.post("/verify", paymentController.verifyWalletTopUp.bind(paymentController));
  router.get("/activity", paymentController.getFinancialActivity.bind(paymentController));

  return router;
}
