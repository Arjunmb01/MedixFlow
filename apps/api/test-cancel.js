const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("Starting test-cancel...");
  const appointmentId = 'd7f3fed9-6778-40f1-adfc-9765a20e8865';
  const reason = 'test';

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: true }
    });
    console.log("Appointment Found:", !!appointment);
    if (!appointment) return;
    
    // Simulate updating
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED', reason }
    });
    console.log("Appointment Updated:", updated.id);

    // Simulate notification
    await prisma.notification.create({
      data: {
        userId: appointment.doctorId,
        type: 'APPOINTMENT',
        title: 'Appointment Cancelled',
        message: 'Patient has cancelled...'
      }
    });
    console.log("Notification created");

  } catch(e) {
    console.error("ERROR CAUGHT IN SCRIPT:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
