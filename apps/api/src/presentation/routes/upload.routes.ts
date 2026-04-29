import { Router } from "express"
import multer from "multer"
import { MESSAGES } from "@/shared/constants"
import { uploadFile } from "@/presentation/controllers/UploadController"
import { storage } from "@/infrastructure/services/cloudinary.config"
import { container } from "@/infrastructure/services/container/CompositionRoot"

const router = Router()
const auth = container.authMiddleware;

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req: any, file: any, cb: any) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(MESSAGES.INVALID_FILE_TYPE))
        }
    }
})

router.post("/upload/image", auth.authenticate, upload.single('image'), uploadFile)

export default router
