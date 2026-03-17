import EmailService from "@/infrastructure/email/email.service"
import * as staffRepository from "../repositories/staff.repository"

export const createDoctorUsecase = async (payload: any) => {

  const result = await staffRepository.createDoctor(payload)
  
  await EmailService.sendSetPasswordEmail(
    result.user.email,
    result.setupToken.token,
    payload.firstName
  )

  return result.user

}