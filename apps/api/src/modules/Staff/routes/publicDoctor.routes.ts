import { Router } from "express"
import * as controller from "../controllers/publicDoctor.controller"
import { authMiddleware } from "@/core/middleware/auth.middleware"

const router = Router()

router.use(authMiddleware)

router.get("/", controller.getAllDoctors)
router.get("/:id", controller.getDoctorDetails)

export default router
