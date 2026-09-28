import { prisma } from "../src/config/prisma.js";

async function resetDemoData() {
  console.log(
    "Resetting ELARA test/demo data..."
  );

  try {
    await prisma.$transaction(
      async (tx) => {
        // ============================================
        // TRANSACTIONAL / OPERATIONAL DATA
        // ============================================

        const paymentResult =
          await tx.payment.deleteMany();

        console.log(
          `Deleted ${paymentResult.count} payments.`
        );

        const housekeepingResult =
          await tx.housekeepingTask.deleteMany();

        console.log(
          `Deleted ${housekeepingResult.count} housekeeping tasks.`
        );

        const maintenanceResult =
          await tx.maintenanceTicket.deleteMany();

        console.log(
          `Deleted ${maintenanceResult.count} maintenance tickets.`
        );

        const reservationResult =
          await tx.reservation.deleteMany();

        console.log(
          `Deleted ${reservationResult.count} reservations.`
        );

        // ============================================
        // CUSTOMER TEST ACCOUNTS
        // ============================================

        const customerUsers =
          await tx.user.findMany({
            where: {
              role: "CUSTOMER"
            },

            select: {
              id: true
            }
          });

        const customerIds =
          customerUsers.map(
            (user) =>
              user.id
          );

        if (
          customerIds.length
        ) {
          const customerProfiles =
            await tx.customerProfile.deleteMany({
              where: {
                userId: {
                  in:
                    customerIds
                }
              }
            });

          console.log(
            `Deleted ${customerProfiles.count} customer profiles.`
          );

          const customers =
            await tx.user.deleteMany({
              where: {
                id: {
                  in:
                    customerIds
                }
              }
            });

          console.log(
            `Deleted ${customers.count} customer accounts.`
          );
        }

        // ============================================
        // RESET ROOM STATUS
        // ============================================

        const rooms =
          await tx.room.updateMany({
            data: {
              status:
                "AVAILABLE",

              notes:
                null
            }
          });

        console.log(
          `Reset ${rooms.count} rooms to AVAILABLE.`
        );
      }
    );

    console.log("");
    console.log(
      "ELARA demo data reset completed."
    );
    console.log(
      "Admin/staff accounts were preserved."
    );
    console.log(
      "Room types and physical rooms were preserved."
    );
  } catch (
    error
  ) {
    console.error(
      "Reset failed:"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  } finally {
    await prisma.$disconnect();
  }
}

resetDemoData();