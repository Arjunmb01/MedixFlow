import { Request, Response, NextFunction } from "express"
import { PatientRepository } from "../repostries/patient.repository"
import { UpdatePatientProfileUseCase } from "../usesCases/updatePatientProfile.usecase"
import { UpdateEmergencyContactUseCase } from "../usesCases/updateEmergencyContact.usecase"
import { GetPatientProfileUseCase } from "../usesCases/getPatientProfile.usecase"
import { UpdatePasswordUseCase } from "../usesCases/updatePassword.usecase"
import { getPatientsQuerySchema } from "../dto/getPatientsQuery.dto"
import sessionService from "../../auth/services/session.service"

const repo = new PatientRepository()

export const updatePatientProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user.id
    const usecase = new UpdatePatientProfileUseCase(repo)
    const result = await usecase.execute(patientId, req.body)

    res.status(200).json({
      message: "Profile updated successfully",
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const updateEmergencyContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user.id
    const usecase = new UpdateEmergencyContactUseCase(repo)
    const result = await usecase.execute(
      patientId,
      req.body.contacts
    )

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getPatientProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user.id
    const usecase = new GetPatientProfileUseCase(repo)
    const patient = await usecase.execute(patientId)

    res.json(patient)
  } catch (error) {
    next(error)
  }
}

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user.id
    const usecase = new UpdatePasswordUseCase(repo)
    const result = await usecase.execute(patientId, req.body)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

// Admin controllers
export const getAllPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = getPatientsQuerySchema.parse(req.query)
    const result = await repo.getPatients(query)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const blockPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id as string
  const { status } = req.body

  try {
    const result = await repo.toggleBlock(id, status)

    // If blocking/suspending, delete the user's session to force immediate logout
    if (status === "INACTIVE" || status === "SUSPENDED") {
      await sessionService.deleteSession(id)
    }

    res.json({
      message: "Patient status updated successfully",
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id as string

  try {
    await repo.deletePatient(id)
    res.json({
      message: "Patient deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}

export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id as string

  try {
    const patient = await repo.findById(id)
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" })
    }
    res.json(patient)
  } catch (error) {
    next(error)
  }
}

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await repo.getStats()
    res.json(stats)
  } catch (error) {
    next(error)
  }
}