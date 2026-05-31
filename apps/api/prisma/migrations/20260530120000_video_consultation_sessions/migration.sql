-- Idempotent: safe if column/enums/tables already exist from prior db push

ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "consultationType" "ConsultationType" NOT NULL DEFAULT 'CLINIC';

DO $$ BEGIN
  CREATE TYPE "ConsultationSessionStatus" AS ENUM ('WAITING', 'IN_CALL', 'ENDED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ParticipantRole" AS ENUM ('DOCTOR', 'PATIENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ConsultationSession" (
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

CREATE TABLE IF NOT EXISTS "ConsultationParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "socketId" TEXT,

    CONSTRAINT "ConsultationParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ConsultationChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "ParticipantRole" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ConsultationSession_roomId_key" ON "ConsultationSession"("roomId");
CREATE UNIQUE INDEX IF NOT EXISTS "ConsultationSession_appointmentId_key" ON "ConsultationSession"("appointmentId");
CREATE UNIQUE INDEX IF NOT EXISTS "ConsultationSession_consultationId_key" ON "ConsultationSession"("consultationId");
CREATE INDEX IF NOT EXISTS "ConsultationSession_doctorId_status_idx" ON "ConsultationSession"("doctorId", "status");
CREATE INDEX IF NOT EXISTS "ConsultationSession_patientId_status_idx" ON "ConsultationSession"("patientId", "status");
CREATE INDEX IF NOT EXISTS "ConsultationParticipant_userId_idx" ON "ConsultationParticipant"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ConsultationParticipant_sessionId_userId_key" ON "ConsultationParticipant"("sessionId", "userId");
CREATE INDEX IF NOT EXISTS "ConsultationChatMessage_sessionId_createdAt_idx" ON "ConsultationChatMessage"("sessionId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ConsultationSession" ADD CONSTRAINT "ConsultationSession_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ConsultationParticipant" ADD CONSTRAINT "ConsultationParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ConsultationChatMessage" ADD CONSTRAINT "ConsultationChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConsultationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
