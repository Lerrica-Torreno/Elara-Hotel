import {
  paymentReference
} from '../utils/references.js';

export async function recordPayment(tx, input) {
  // Treat a repeated provider reference as an idempotent retry for this reservation.
  if (input.providerRef) {
    const existingProviderPayment =
      await tx.payment.findFirst({
        where: {
          reservationId:
            input.reservationId,
          providerRef:
            input.providerRef
        }
      });

    if (
      existingProviderPayment &&
      existingProviderPayment.status !==
        'PENDING'
    ) {
      return existingProviderPayment;
    }
  }

  // Complete the oldest pending transaction when one exists instead of creating a duplicate row.
  const pendingPayment =
    await tx.payment.findFirst({
      where: {
        reservationId:
          input.reservationId,
        status:
          'PENDING'
      },
      orderBy: {
        createdAt:
          'asc'
      }
    });

  // Keep the transaction fields shared by pending-payment updates and new-payment inserts.
  const data = {
    amount:
      input.amount,
    method:
      input.method,
    status:
      input.status,
    provider:
      input.provider || null,
    providerRef:
      input.providerRef || null,
    paidAt:
      input.paidAt || null
  };

  if (pendingPayment) {
    return tx.payment.update({
      where: {
        id:
          pendingPayment.id
      },
      data
    });
  }

  return tx.payment.create({
    data: {
      reference:
        paymentReference(),
      reservationId:
        input.reservationId,
      ...data
    }
  });
}