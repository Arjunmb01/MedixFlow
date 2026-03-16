import { Router } from "express"

import { authMiddleware } from "@/core/middleware/auth.middleware"
import { authorize } from "@/core/middleware/authorize.middleware"
import { validate } from "@/core/middleware/validate.middleware"

import { updatePatientSchema } from "../dto/updatePatient.dto"
import { emergencyContactSchema } from "../dto/emergencyContact.dto"

import * as controller from "../controllers/patient.controller"

const router = Router()

router.use(authMiddleware, authorize(["PATIENT"]))

router.get(
    "/profile",
    controller.getPatientProfile
)

router.put(
    "/profile",
    validate(updatePatientSchema),
    controller.updatePatientProfile
)

router.put(
    "/emergency-contact",
    validate(emergencyContactSchema),
    controller.updateEmergencyContacts
)

router.put(
    "/password",
    controller.updatePassword
)

export default router