import * as repo from "../repositories/staff.repository"

export const getDoctorsUsecase = async () => {
  return repo.getDoctors()
}