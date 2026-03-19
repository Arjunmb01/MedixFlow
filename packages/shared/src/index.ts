export const ROLES = {
  ADMIN: "ADMIN",
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR"
} as const;

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED"
} as const;

export type UserRole = keyof typeof ROLES;
export type UserStatus = keyof typeof USER_STATUS;
