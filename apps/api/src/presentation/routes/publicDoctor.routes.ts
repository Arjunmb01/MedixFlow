import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createPublicDoctorRoutes(): Router {
  const { publicDoctorController } = getContainer();
  const router = Router();

  router.get("/", publicDoctorController.getAllDoctors);
  router.get("/:id", publicDoctorController.getDoctorDetails);

  return router;
}
