-- CreateTable
CREATE TABLE "HotelSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "hotelName" TEXT NOT NULL DEFAULT 'ELARA Hotel',
    "location" TEXT NOT NULL DEFAULT 'Tagaytay, Philippines',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "checkInTime" TEXT NOT NULL DEFAULT '14:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '12:00',
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "cancellationPolicy" TEXT,
    "reservationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelSettings_pkey" PRIMARY KEY ("id")
);
