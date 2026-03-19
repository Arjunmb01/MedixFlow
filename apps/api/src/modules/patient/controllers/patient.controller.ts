import { Request, Response, NextFunction } from "express"
import { StatusCode, MESSAGES } from "../../../core/constants";
import { PatientRepository } from "../repositories/patient.repository"
import { UpdatePatientProfileUseCase } from "../usecases/updatePatientProfile.usecase"
import { UpdateEmergencyContactUseCase } from "../usecases/updateEmergencyContact.usecase"
import { GetPatientProfileUseCase } from "../usecases/getPatientProfile.usecase"
import { UpdatePasswordUseCase } from "../usecases/updatePassword.usecase"
import { GetAllPatientsUseCase } from "../usecases/getAllPatients.usecase"
import { GetPatientByIdUseCase } from "../usecases/getPatientById.usecase"
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

    res.status(StatusCode.OK).json({
      message: MESSAGES.PROFILE_UPDATED,
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

    res.status(StatusCode.OK).json(result)
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

    res.status(StatusCode.OK).json(result)
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
    const usecase = new GetAllPatientsUseCase(repo)
    const result = await usecase.execute(query)
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
      message: MESSAGES.PATIENT_STATUS_UPDATED,
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
      message: MESSAGES.PATIENT_DELETED
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
    const usecase = new GetPatientByIdUseCase(repo)
    const patient = await usecase.execute(id)
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