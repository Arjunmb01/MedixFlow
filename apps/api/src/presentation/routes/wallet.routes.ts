import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

const router = Router();
const paymentController = container.paymentController;
const auth = container.authMiddleware;

// All wallet routes require patient authorization
router.use(auth.authenticatePatient);

router.get(
  "/",
  paymentController.getWalletBalance.bind(paymentController)
);

router.post(
  "/top-up",
  paymentController.topUpWallet.bind(paymentController)
);

router.post(
  "/verify",
  paymentController.verifyWalletTopUp.bind(paymentController)
);

router.get(
  "/activity",
  paymentController.getFinancialActivity.bind(paymentController)
);

export default router;
