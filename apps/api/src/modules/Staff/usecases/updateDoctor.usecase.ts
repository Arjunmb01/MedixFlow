import * as staffRepository from "../repositories/staff.repository"

export const updateDoctorUsecase = async (id: string, payload: any) => {

  return staffRepository.updateDoctor(id, payload)

}