import { Router } from "express"
import { container } from "@/infrastructure/services/container/CompositionRoot"

const router = Router()
const authMiddleware = container.authMiddleware;

router.use(authMiddleware)

router.get("/", container.publicDoctorController.getAllDoctors)
router.get("/:id", container.publicDoctorController.getDoctorDetails)

export default router

