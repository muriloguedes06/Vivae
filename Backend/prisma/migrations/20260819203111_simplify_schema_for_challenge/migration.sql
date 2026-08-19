/*
  Warnings:

  - The values [SALES_PAUSED,SOLD_OUT] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REFUNDED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PROCESSING,CANCELLED,REFUNDED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REFUNDED] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DELETED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ageRating` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationReason` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `catalogEventId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `salesEndAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `salesStartAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketingMode` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `venueId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `discountTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `feeTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `ticketLotId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitFee` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `cardBrand` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cardLastFour` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `failureCode` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `installments` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `providerRef` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `holderEmail` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `seatId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `ticketLotId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `TicketType` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `TicketType` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `TicketValidation` table. All the data in the column will be lost.
  - You are about to drop the column `gate` on the `TicketValidation` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `TicketValidation` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CatalogEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventStaff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Seat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeatMap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketLot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Venue` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[externalSource,externalId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shareToken]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startsAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venueName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shareToken` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `TicketType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED');
ALTER TABLE "public"."Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "public"."EventStatus_old";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');
ALTER TABLE "public"."Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('ACTIVE', 'USED', 'CANCELLED');
ALTER TABLE "public"."Ticket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Ticket" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "Ticket" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'BLOCKED');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_catalogEventId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_venueId_fkey";

-- DropForeignKey
ALTER TABLE "EventSession" DROP CONSTRAINT "EventSession_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventSession" DROP CONSTRAINT "EventSession_venueId_fkey";

-- DropForeignKey
ALTER TABLE "EventStaff" DROP CONSTRAINT "EventStaff_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventStaff" DROP CONSTRAINT "EventStaff_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_ticketLotId_fkey";

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_seatMapId_fkey";

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_ticketTypeId_fkey";

-- DropForeignKey
ALTER TABLE "SeatMap" DROP CONSTRAINT "SeatMap_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_seatId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_ticketLotId_fkey";

-- DropForeignKey
ALTER TABLE "TicketLot" DROP CONSTRAINT "TicketLot_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "TicketLot" DROP CONSTRAINT "TicketLot_ticketTypeId_fkey";

-- DropIndex
DROP INDEX "Event_salesStartAt_salesEndAt_idx";

-- DropIndex
DROP INDEX "Event_slug_key";

-- DropIndex
DROP INDEX "OrderItem_ticketLotId_idx";

-- DropIndex
DROP INDEX "Payment_providerRef_key";

-- DropIndex
DROP INDEX "Payment_status_createdAt_idx";

-- DropIndex
DROP INDEX "Ticket_sessionId_seatId_key";

-- DropIndex
DROP INDEX "TicketType_eventId_active_sortOrder_idx";

-- DropIndex
DROP INDEX "TicketValidation_status_scannedAt_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "ageRating",
DROP COLUMN "bannerUrl",
DROP COLUMN "cancellationReason",
DROP COLUMN "cancelledAt",
DROP COLUMN "catalogEventId",
DROP COLUMN "publishedAt",
DROP COLUMN "salesEndAt",
DROP COLUMN "salesStartAt",
DROP COLUMN "slug",
DROP COLUMN "ticketingMode",
DROP COLUMN "timezone",
DROP COLUMN "venueId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalSource" TEXT,
ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "venueName" TEXT NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cancelledAt",
DROP COLUMN "discountTotal",
DROP COLUMN "feeTotal",
DROP COLUMN "subtotal";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "sessionId",
DROP COLUMN "ticketLotId",
DROP COLUMN "unitFee";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "cardBrand",
DROP COLUMN "cardLastFour",
DROP COLUMN "failureCode",
DROP COLUMN "installments",
DROP COLUMN "metadata",
DROP COLUMN "method",
DROP COLUMN "provider",
DROP COLUMN "providerRef",
DROP COLUMN "refundedAt";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "holderEmail",
DROP COLUMN "seatId",
DROP COLUMN "sessionId",
DROP COLUMN "ticketLotId",
ADD COLUMN     "shareToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketType" DROP COLUMN "color",
DROP COLUMN "sortOrder",
ADD COLUMN     "price" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "reserved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sold" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TicketValidation" DROP COLUMN "deviceId",
DROP COLUMN "gate",
DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
DROP COLUMN "emailVerifiedAt",
DROP COLUMN "lastLoginAt",
DROP COLUMN "phone",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "CatalogEvent";

-- DropTable
DROP TABLE "EventSession";

-- DropTable
DROP TABLE "EventStaff";

-- DropTable
DROP TABLE "Seat";

-- DropTable
DROP TABLE "SeatMap";

-- DropTable
DROP TABLE "TicketLot";

-- DropTable
DROP TABLE "Venue";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "SessionStatus";

-- DropEnum
DROP TYPE "StaffRole";

-- DropEnum
DROP TYPE "TicketingMode";

-- CreateIndex
CREATE INDEX "Event_status_startsAt_idx" ON "Event"("status", "startsAt");

-- CreateIndex
CREATE INDEX "Event_city_state_idx" ON "Event"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Event_externalSource_externalId_key" ON "Event"("externalSource", "externalId");

-- CreateIndex
CREATE INDEX "OrderItem_ticketTypeId_idx" ON "OrderItem"("ticketTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_shareToken_key" ON "Ticket"("shareToken");

-- CreateIndex
CREATE INDEX "TicketType_eventId_active_idx" ON "TicketType"("eventId", "active");
