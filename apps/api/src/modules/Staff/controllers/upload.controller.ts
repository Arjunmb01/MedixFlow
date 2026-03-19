import { Request, Response, NextFunction } from "express"
import { StatusCode, MESSAGES } from "../../../core/constants";


export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            console.error("No file in request. Body:", req.body);
            return res.status(StatusCode.BAD_REQUEST).json({ message: MESSAGES.NO_FILE_UPLOADED })
        }

        console.log("File uploaded successfully:", req.file);


        // Return the Cloudinary URL
        const fileUrl = (req.file as any).path

        res.json({
            url: fileUrl,
            filename: (req.file as any).filename || (req.file as any).public_id
        })
    } catch (error) {
        next(error)
    }
}
