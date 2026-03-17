import * as staffRepository from "../repositories/staff.repository"

export const deleteDoctorUsecase = async (userId: string) => {

  return staffRepository.deleteDoctor(userId)

}