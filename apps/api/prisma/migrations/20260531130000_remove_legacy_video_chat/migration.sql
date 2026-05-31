-- Remove legacy video/chat tables superseded by ConsultationSession model

ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_roomId_fkey";
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_senderId_fkey";
ALTER TABLE "ChatRoom" DROP CONSTRAINT IF EXISTS "ChatRoom_consultationId_fkey";
ALTER TABLE "ChatRoom" DROP CONSTRAINT IF EXISTS "ChatRoom_doctorId_fkey";
ALTER TABLE "ChatRoom" DROP CONSTRAINT IF EXISTS "ChatRoom_patientId_fkey";
ALTER TABLE "VideoSession" DROP CONSTRAINT IF EXISTS "VideoSession_consultationId_fkey";

ALTER TABLE "Consultation" DROP COLUMN IF EXISTS "aiAnalysisStatus";

ALTER TABLE "ConsultationDraft" DROP COLUMN IF EXISTS "aiSummary";
ALTER TABLE "ConsultationDraft" DROP COLUMN IF EXISTS "transcript";

DROP TABLE IF EXISTS "ChatMessage";
DROP TABLE IF EXISTS "ChatRoom";
DROP TABLE IF EXISTS "VideoSession";

DROP TYPE IF EXISTS "AiAnalysisStatus";
DROP TYPE IF EXISTS "VideoSessionStatus";
