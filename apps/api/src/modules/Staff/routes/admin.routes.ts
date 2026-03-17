import { Router } from "express"
import { authMiddleware } from "@/core/middleware/auth.middleware"
import { authorize } from "@/core/middleware/authorize.middleware"
import * as patientController from "../../patient/controllers/patient.controller"

const router = Router()

// All routes here require ADMIN role
router.use(authMiddleware, authorize(["ADMIN"]))

router.get("/patients", patientController.getAllPatients)
router.get("/patients/:id", patientController.getPatientById)
router.patch("/patients/:id/status", patientController.blockPatient)
router.delete("/patients/:id", patientController.deletePatient)
router.get("/stats", patientController.getDashboardStats)

export default router
