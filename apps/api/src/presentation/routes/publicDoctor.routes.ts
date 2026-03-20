import { Router } from "express"
import { container } from "@/infrastructure/container/AppContainer"
import { authMiddleware } from "@/presentation/middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/", container.publicDoctorController.getAllDoctors)
router.get("/:id", container.publicDoctorController.getDoctorDetails)

export default router
