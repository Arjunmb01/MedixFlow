import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

const router = Router();
const paymentController = container.paymentController;
const authMiddleware = container.authMiddleware;

// All wallet routes require patient authorization
router.use(authMiddleware, authorize([UserRole.PATIENT]));

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
