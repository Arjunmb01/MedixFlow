import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { MESSAGES } from "@/shared/constants";
import { uploadFile } from "@/presentation/controllers/UploadController";
import { getCloudinaryStorage } from "@/infrastructure/services/cloudinary.loader";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createUploadRoutes(): Router {
  const { authMiddleware: auth } = getContainer();
  const router = Router();

  const uploadMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storage = await getCloudinaryStorage();
      const upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
          const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error(MESSAGES.INVALID_FILE_TYPE));
          }
        },
      }).single("image");
      upload(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  router.post("/upload/image", auth.authenticate, uploadMiddleware, uploadFile);

  return router;
}
