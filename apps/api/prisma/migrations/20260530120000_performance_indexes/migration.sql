-- Performance indexes for dashboard, notifications, and wallet queries

CREATE INDEX IF NOT EXISTS "Appointment_patientId_appointmentDate_status_idx" ON "Appointment"("patientId", "appointmentDate", "status");
CREATE INDEX IF NOT EXISTS "Appointment_status_appointmentDate_idx" ON "Appointment"("status", "appointmentDate");
CREATE INDEX IF NOT EXISTS "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");
CREATE INDEX IF NOT EXISTS "RescheduleProposal_appointmentId_status_idx" ON "RescheduleProposal"("appointmentId", "status");
CREATE INDEX IF NOT EXISTS "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt" DESC);
