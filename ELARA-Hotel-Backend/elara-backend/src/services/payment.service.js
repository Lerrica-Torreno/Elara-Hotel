import {
  paymentReference
} from '../utils/references.js';

export async function recordPayment(tx, input) {
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