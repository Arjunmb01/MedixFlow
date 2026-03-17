import { Router } from "express"

import {
  getDoctorsController,
  createDoctorController,
  updateDoctorController,
  blockDoctorController,
  deleteDoctorController,
  setupPasswordController
} from "../controllers/staff.controller"

const router = Router()

router.get("/", getDoctorsController)
router.post("/", createDoctorController)
router.post("/setup-password", setupPasswordController)
router.patch("/:id/status", blockDoctorController)
router.patch("/:id", updateDoctorController)
router.delete("/:id", deleteDoctorController)

export default router