-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "discountId" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_promotionId_idx" ON "Reservation"("promotionId");

-- CreateIndex
CREATE INDEX "Reservation_discountId_idx" ON "Reservation"("discountId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
