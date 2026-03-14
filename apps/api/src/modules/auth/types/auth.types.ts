export interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

export interface RegisterCacheData extends SignupData {
  passwordHash: string
}