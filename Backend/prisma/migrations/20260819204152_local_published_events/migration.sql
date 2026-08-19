/*
  Warnings:

  - A unique constraint covering the columns `[organizerId,externalSource,externalId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_externalSource_externalId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Event_organizerId_externalSource_externalId_key" ON "Event"("organizerId", "externalSource", "externalId");
