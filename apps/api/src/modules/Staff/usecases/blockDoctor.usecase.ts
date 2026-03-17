import { UserStatus } from "@prisma/client"
import * as staffRepository from "../repositories/staff.repository"

export const blockDoctorUsecase = async (userId: string, status: UserStatus) => {

  return staffRepository.blockDoctor(userId, status)

}