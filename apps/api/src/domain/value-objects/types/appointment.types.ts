export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
}

export interface DoctorScheduleInput {
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  slotCapacity: number;
}


export interface AppointmentDateTime {
  appointmentDate: Date;
  slotStart : string
}