import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createWalletRoutes(): Router {
  const { paymentController, authMiddleware: auth } = getContainer();
  const router = Router();

<<<<<<< HEAD
  router.use(auth.authenticatePatient);
  router.get("/", paymentController.getWalletBalance.bind(paymentController));
  router.post("/top-up", paymentController.topUpWallet.bind(paymentController));
  router.post("/verify", paymentController.verifyWalletTopUp.bind(paymentController));
  router.get("/activity", paymentController.getFinancialActivity.bind(paymentController));
=======
// All wallet routes require patient authorization
router.use(auth.authenticatePatient);
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

  return router;
}
