import { Request, Response, NextFunction } from "express"
import { randomBytes } from "crypto"
import * as repo from "../repositories/staff.repository"
import { createDoctorSchema, getDoctorsQuerySchema } from "../dto/staff.dto"
import EmailService from "@/infrastructure/email/email.service"
import sessionService from "@/modules/auth/services/session.service"

export const getDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = getDoctorsQuerySchema.parse(req.query)
        const result = await repo.getDoctors(query)
        res.json(result)
    } catch (error: any) {
        next(error)
    }
}

export const createDoctorController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = createDoctorSchema.parse(req.body)
        
        // Generate a temporary 8-character password
        const tempPassword = randomBytes(4).toString('hex')
        
        const result = await repo.createDoctor(payload, tempPassword)
        
        // Construct setup link for response (fallback)
        const host = req.get('host')
        const protocol = req.protocol
        const setupLink = `${protocol}://${host === 'localhost:5000' ? 'localhost:5173' : host}/setup-password?token=${result.setupToken.token}`

        // Send Welcome Email with Password
        try {
            await EmailService.sendDoctorCredentialsEmail(
                payload.email,
                payload.firstName,
                tempPassword
            )
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError)
        }

        res.status(201).json({
            message: "Doctor created successfully and credentials sent to email",
            data: {
                ...result.user,
                temporaryPassword: tempPassword
            },
            setupLink
        })
    } catch (error: any) {
        next(error)
    }
}

export const updateDoctorController = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string
    try {
        const doctor = await repo.updateDoctor(id, req.body)
        res.json({
            message: "Doctor updated successfully",
            data: doctor
        })
    } catch (error: any) {
        next(error)
    }
}

export const blockDoctorController = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string
    const { status } = req.body

    try {
        const doctor = await repo.blockDoctor(id, status)

        // If blocking/suspending, delete the user's session to force immediate logout
        if (status === "SUSPENDED" || status === "INACTIVE") {
            await sessionService.deleteSession(id)
        }

        res.json({
            message: "Doctor status updated successfully",
            data: doctor
        })
    } catch (error: any) {
        next(error)
    }
}

export const deleteDoctorController = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string
    try {
        await repo.deleteDoctor(id)
        res.json({
            message: "Doctor deleted successfully"
        })
    } catch (error: any) {
        next(error)
    }
}

export const setupPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body
    try {
        if (!token || !password) {
            return res.status(400).json({ error: "Token and password are required" })
        }
        await repo.setupPassword(token, password)
        res.json({ message: "Password setup successful" })
    } catch (error: any) {
        next(error)
    }
}