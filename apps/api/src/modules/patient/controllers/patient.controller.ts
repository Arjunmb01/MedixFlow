import { Request, Response, NextFunction } from "express"

import { PatientRepository } from "../repostries/patient.repository"

import { UpdatePatientProfileUseCase } from "../usesCases/updatePatientProfile.usecase"
import { UpdateEmergencyContactUseCase } from "../usesCases/updateEmergencyContact.usecase"
import { GetPatientProfileUseCase } from "../usesCases/getPatientProfile.usecase"
import { UpdatePasswordUseCase } from "../usesCases/updatePassword.usecase"

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