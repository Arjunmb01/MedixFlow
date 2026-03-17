import { prisma } from "@/infrastructure/database/prismaClient"
import { CreateDoctorPayload, GetDoctorsQuery } from "../types/staff.types"
import { UserStatus } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

export const getDoctors = async (query: GetDoctorsQuery) => {
    const { search, specialty, status, page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const where: any = {
        user: {
            deletedAt: null
        }
    }

    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
    }

    if (specialty) {
        where.specialty = specialty
    }

    if (status) {
        where.user = { ...where.user, status }
    }

    const [doctors, total] = await Promise.all([
        prisma.doctorProfile.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true,
                        createdAt: true
                    }
                },
                schedules: true
            },
            skip,
            take: limit,
            orderBy: {
                firstName: "asc"
            }
        }),
        prisma.doctorProfile.count({ where })
    ])

    return {
        data: doctors,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export const createDoctor = async (data: CreateDoctorPayload, temporaryPassword?: string) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    })

    if (existingUser) {
        throw new Error("A user with this email already exists")
    }

    const passwordHash = temporaryPassword 
        ? await bcrypt.hash(temporaryPassword, 10)
        : "PENDING_SETUP"

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: "DOCTOR",
                status: temporaryPassword ? "ACTIVE" : "INACTIVE",
                doctorProfile: {
                    create: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        phone: data.phone,
                        specialty: data.specialty,
                        consultationFee: data.consultationFee,
                        licenseNumber: data.licenseNumber,
                        schedules: {
                            create: data.schedules
                        }
                    }
                }
            }
        })

        // Create setup token regardless, if we want them to be able to reset/setup still
        const setupToken = await tx.passwordSetupToken.create({
            data: {
                userId: user.id,
                token: uuidv4(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        })

        return { user, setupToken, temporaryPassword }
    })
}


export const updateDoctor = async (doctorId: string, data: any) => {
    return prisma.$transaction(async (tx) => {
        // Update Doctor Profile
        const profile = await tx.doctorProfile.update({
            where: { id: doctorId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                specialty: data.specialty,
                licenseNumber: data.licenseNumber,
                consultationFee: data.consultationFee
            },
            include: { user: true }
        })

        // Update User (Email)
        if (data.email && data.email !== profile.user.email) {
            await tx.user.update({
                where: { id: profile.id },
                data: { email: data.email }
            })
        }

        // Update Schedules if provided
        if (data.schedules) {
            // Delete existing schedules
            await tx.doctorSchedule.deleteMany({
                where: { doctorId: profile.id }
            })

            // Create new schedules
            await tx.doctorSchedule.createMany({
                data: data.schedules.map((s: any) => ({
                    ...s,
                    doctorId: profile.id
                }))
            })
        }

        return profile
    }, {
        timeout: 15000 // Increase timeout to 15s to handle database latencies
    })
}


export const blockDoctor = async (userId: string, status: UserStatus) => {

  return prisma.user.update({
    where: { id: userId },
    data: { status }
  })

}


export const deleteDoctor = async (userId: string) => {

  return prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      status: "INACTIVE"
    }
  })

}

export const setupPassword = async (token: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    return prisma.$transaction(async (tx) => {
        const setupToken = await tx.passwordSetupToken.findUnique({
            where: { token },
            include: { user: true }
        })

        if (!setupToken) {
            const error = new Error("Invalid setup token")
            ;(error as any).status = 400
            throw error
        }

        if (setupToken.expiresAt < new Date()) {
            const error = new Error("Setup token has expired")
            ;(error as any).status = 400
            throw error
        }

        // Update user
        await tx.user.update({
            where: { id: setupToken.userId },
            data: { 
                passwordHash: hashedPassword,
                status: "ACTIVE" 
            }
        })

        // Delete token
        await tx.passwordSetupToken.delete({
            where: { id: setupToken.id }
        })

        return { success: true }
    }, {
        timeout: 15000
    })
}