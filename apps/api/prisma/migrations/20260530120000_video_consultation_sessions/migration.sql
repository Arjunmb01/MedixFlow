-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "consultationType" "ConsultationType" NOT NULL DEFAULT 'CLINIC';

-- CreateEnum
CREATE TYPE "ConsultationSessionStatus" AS ENUM ('WAITING', 'IN_CALL', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('DOCTOR', 'PATIENT');

-- CreateTable
CREATE TABLE "ConsultationSession" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "consultationId" TEXT,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "ConsultationSessionStatus" NOT NULL DEFAULT 'WAITING',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "socketId" TEXT,

    CONSTRAINT "ConsultationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "ParticipantRole" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationSession_roomId_key" ON "ConsultationSession"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationSession_appointmentId_key" ON "ConsultationSession"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationSession_consultationId_key" ON "ConsultationSession"("consultationId");

-- CreateIndex
CREATE INDEX "ConsultationSession_doctorId_status_idx" ON "ConsultationSession"("doctorId", "status");

-- CreateIndex
CREATE INDEX "ConsultationSession_patientId_status_idx" ON "ConsultationSession"("patientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationParticipant_sessionId_userId_key" ON "ConsultationParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "ConsultationParticipant_userId_idx" ON "ConsultationParticipant"("userId");

-- CreateIndex
CREATE INDEX "ConsultationChatMessage_sessionId_createdAt_idx" ON "ConsultationChatMessage"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationParticipant" ADD CONSTRAINT "ConsultationParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationChatMessage" ADD CONSTRAINT "ConsultationChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
