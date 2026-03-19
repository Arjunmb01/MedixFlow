/*
  Warnings:

  - You are about to drop the column `specialty` on the `DoctorProfile` table. All the data in the column will be lost.
  - Added the required column `specializationId` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DoctorProfile_specialty_idx";

-- AlterTable
ALTER TABLE "DoctorProfile" DROP COLUMN "specialty",
ADD COLUMN     "specializationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Specialization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_name_key" ON "Specialization"("name");

-- CreateIndex
CREATE INDEX "DoctorProfile_specializationId_idx" ON "DoctorProfile"("specializationId");

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
