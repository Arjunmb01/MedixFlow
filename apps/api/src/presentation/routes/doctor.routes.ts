import { Router } from "express";
import { authMiddleware } from "@/presentation/middleware/auth.middleware";
import { authorize } from "@/presentation/middleware/authorize.middleware";
import { container } from "@/infrastructure/container/AppContainer";

const router = Router();
const controller = container.doctorController;

router.use(authMiddleware);
router.use(authorize(["DOCTOR"]));

router.get("/profile", controller.getDoctorProfile);
router.put("/profile", controller.updateDoctorProfile);
router.put("/update-password", controller.updateDoctorPassword);
router.get("/dashboard-stats", controller.getDoctorDashboardStats);
router.put("/schedules", controller.updateDoctorSchedules);

export default router;
