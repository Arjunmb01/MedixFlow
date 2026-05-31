/** Matches backend video consultation join window (15 min before start, 60 min after end). */
export function isWithinVideoConsultationWindow(
  date: string | Date,
  slotStart: string,
  slotEnd: string
): boolean {
  const now = new Date();
  const d = new Date(date);

  const toDateTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(d);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  };

  const start = toDateTime(slotStart);
  const end = toDateTime(slotEnd);
  const minutesBeforeStart = (start.getTime() - now.getTime()) / (1000 * 60);
  const minutesAfterEnd = (now.getTime() - end.getTime()) / (1000 * 60);
  return minutesBeforeStart <= 15 && minutesAfterEnd <= 60;
}

export function canJoinVideoConsultation(appointment: {
  consultationType?: string;
  status: string;
  appointmentDate: string | Date;
  slotStart: string;
  slotEnd: string;
}): boolean {
  if (appointment.consultationType !== "VIDEO") return false;
  if (appointment.status !== "BOOKED" && appointment.status !== "COMPLETED") return false;
  return isWithinVideoConsultationWindow(
    appointment.appointmentDate,
    appointment.slotStart,
    appointment.slotEnd
  );
}
