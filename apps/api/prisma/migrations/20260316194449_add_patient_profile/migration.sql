/*
  Warnings:

  - A unique constraint covering the columns `[patientId]` on the table `PatientProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `patientId` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "DoctorSchedule" ADD COLUMN     "fullDay" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "patientId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "DoctorProfile_specialty_idx" ON "DoctorProfile"("specialty");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_patientId_key" ON "PatientProfile"("patientId");
