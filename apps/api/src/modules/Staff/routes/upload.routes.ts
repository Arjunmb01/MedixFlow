import { Router } from "express"
import multer from "multer"
import { MESSAGES } from "../../../core/constants"
import { uploadFile } from "../controllers/upload.controller"
import { authMiddleware } from "@/core/middleware/auth.middleware"
import { storage } from "../../../infrastructure/cloudinary/cloudinary.config"

const router = Router()


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

router.post("/upload/image", authMiddleware, upload.single('image'), uploadFile)

export default router
