import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

const router = Router();
const paymentController = container.paymentController;
const authMiddleware = container.authMiddleware;

router.post(
  "/webhook",
  paymentController.handleWebhook.bind(paymentController)
);

router.get(
  "/wallet",
  authMiddleware,
  authorize([UserRole.PATIENT]),
  paymentController.getWalletBalance.bind(paymentController)
);

router.post(
  "/wallet/top-up",
  authMiddleware,
  authorize([UserRole.PATIENT]),
  paymentController.topUpWallet.bind(paymentController)
);

export default router;
