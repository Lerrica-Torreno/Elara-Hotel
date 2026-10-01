import {
  Prisma
} from '@prisma/client';

import {
  prisma
} from '../config/prisma.js';

import {
  calculateRate
} from './pricing.service.js';

import {
  validatePromotion
} from './promotion.service.js';

import {
  validateDiscount
} from './discount.service.js';

import {
  reservationReference
} from '../utils/references.js';

import {
  paymentReference
} from '../utils/references.js';

import {
  HttpError
} from '../utils/httpError.js';

function nightsBetween(
  a,
  b
) {
  // Convert a check-in/check-out range into the billable night count.
  return Math.ceil(
    (
      b.getTime() -
      a.getTime()
    ) /
      86400000
  );
}

function roundMoney(
  value
) {
  // Round monetary calculations to the currency's two decimal places.
  return Math.round(
    Number(value) * 100
  ) / 100;
}

async function uniqueReservationReference(
  tx
) {
  // Retry reference generation within the transaction to avoid collisions.
  for (
    let i = 0;
    i < 5;
    i += 1
  ) {
    const reference =
      reservationReference();

    const exists =
      await tx.reservation.findUnique({
        where: {
          reference
        }
      });

    if (!exists) {
      return reference;
    }
  }

  throw new HttpError(
    500,
    'Could not generate reservation reference.'
  );
}

export async function createReservation(
  input,
  customerProfileId = null,
  createdByUserId = null
) {
  // Validate the stay and guest, calculate its price, then atomically reserve inventory and persist records.
  const checkInDate =
    new Date(
      `${input.checkInDate}T00:00:00.000Z`
    );

  const checkOutDate =
    new Date(
      `${input.checkOutDate}T00:00:00.000Z`
    );

  const nights =
    nightsBetween(
      checkInDate,
      checkOutDate
    );

  if (
    nights <= 0
  ) {
    throw new HttpError(
      400,
      'Check-out must be after check-in.'
    );
  }

  /*
    For now ELARA allows either a Promotion
    OR a Discount, not both on the same booking.
  */
  if (
    input.promoCode &&
    input.discountCode
  ) {
    throw new HttpError(
      400,
      'A promotion and discount cannot be combined on the same reservation.'
    );
  }

  const roomType =
    await prisma.roomType.findUnique({
      where: {
        id:
          input.roomTypeId
      }
    });

  if (
    !roomType ||
    !roomType.isActive
  ) {
    throw new HttpError(
      404,
      'Room type not found.'
    );
  }

  if (
    input.guestCount >
    roomType.capacity
  ) {
    throw new HttpError(
      400,
      'Guest count exceeds room capacity.'
    );
  }

  // Use the pricing service as the source of truth for the nightly rate.
  const quote =
    await calculateRate({
      roomTypeId:
        roomType.id,

      checkInDate,

      checkOutDate
    });

  if (!quote) {
    throw new HttpError(
      400,
      'Unable to calculate room rate.'
    );
  }

  const nightlyRate =
    Number(
      quote.nightlyRate
    );

  const subtotal =
    roundMoney(
      nightlyRate *
        nights
    );

  let promotion =
    null;

  let discount =
    null;

  let discountAmount =
    0;

  if (
    input.promoCode
  ) {
    const result =
      await validatePromotion(
        input.promoCode,
        subtotal,
        checkInDate
      );

    promotion =
      result.promotion;

    discountAmount =
      result.discountAmount;
  }

  if (
    input.discountCode
  ) {
    const result =
      await validateDiscount(
        input.discountCode,
        subtotal,
        checkInDate,
        {
          /*
            Customer-created bookings can only
            use customer-visible discounts.

            Staff-created reservations may use
            internal hotel discounts.
          */
          customerVisibleOnly:
            !createdByUserId
        }
      );

    discount =
      result.discount;

    discountAmount =
      result.discountAmount;
  }

  const discountedSubtotal =
    roundMoney(
      Math.max(
        subtotal -
          discountAmount,
        0
      )
    );

  const taxAmount =
    roundMoney(
      discountedSubtotal *
        0.12
    );

  const totalAmount =
    roundMoney(
      discountedSubtotal +
        taxAmount
    );

  // Recheck inventory and promotion limits inside a serializable transaction before creating the booking.
  return prisma.$transaction(
    async (tx) => {
      const sellable =
        await tx.room.count({
          where: {
            roomTypeId:
              roomType.id,

            status: {
              notIn: [
                'MAINTENANCE',
                'OUT_OF_SERVICE'
              ]
            }
          }
        });

      const reserved =
        await tx.reservation.count({
          where: {
            roomTypeId:
              roomType.id,

            status: {
              in: [
                'PENDING',
                'CONFIRMED',
                'CHECKED_IN'
              ]
            },

            checkInDate: {
              lt:
                checkOutDate
            },

            checkOutDate: {
              gt:
                checkInDate
            }
          }
        });

      if (
        reserved >=
        sellable
      ) {
        throw new HttpError(
          409,
          'No rooms remain available for the selected dates.'
        );
      }

      /*
        Promotion usage is checked again inside
        the transaction because another booking
        could have consumed the final slot after
        validation but before creation.
      */
      if (
        promotion
      ) {
        const currentPromotion =
          await tx.promotion.findUnique({
            where: {
              id:
                promotion.id
            }
          });

        if (
          !currentPromotion ||
          !currentPromotion.isActive
        ) {
          throw new HttpError(
            409,
            'Promotion is no longer available.'
          );
        }

        if (
          currentPromotion.usageLimit !=
            null &&
          currentPromotion.usageCount >=
            currentPromotion.usageLimit
        ) {
          throw new HttpError(
            409,
            'Promotion usage limit has been reached.'
          );
        }
      }

      const reference =
        await uniqueReservationReference(
          tx
        );

      const reservation =
        await tx.reservation.create({
          data: {
            reference,

            customerId:
              customerProfileId,

            createdByUserId,

            roomTypeId:
              roomType.id,

            guestFirstName:
              input.guestFirstName.trim(),

            guestLastName:
              input.guestLastName.trim(),

            guestEmail:
              input.guestEmail
                .trim()
                .toLowerCase(),

            guestPhone:
              input.guestPhone?.trim() ||
              null,

            guestCount:
              input.guestCount,

            specialRequests:
              input.specialRequests?.trim() ||
              null,

            checkInDate,

            checkOutDate,

            status:
              'CONFIRMED',

            nightlyRate:
              new Prisma.Decimal(
                nightlyRate
              ),

            subtotal:
              new Prisma.Decimal(
                subtotal
              ),

            discountAmount:
              new Prisma.Decimal(
                discountAmount
              ),

            taxAmount:
              new Prisma.Decimal(
                taxAmount
              ),

            totalAmount:
              new Prisma.Decimal(
                totalAmount
              ),

            promotionId:
              promotion?.id ||
              null,

            discountId:
              discount?.id ||
              null
          },

          include: {
            roomType:
              true,

            promotion:
              true,

            discount:
              true
          }
        });

      if (
        input.paymentMethod
      ) {
        await tx.payment.create({
          data: {
            reference:
              paymentReference(),

            reservationId:
              reservation.id,

            amount:
              new Prisma.Decimal(
                totalAmount
              ),

            method:
              input.paymentMethod,

            status:
              'PENDING'
          }
        });
      }

      if (
        promotion
      ) {
        await tx.promotion.update({
          where: {
            id:
              promotion.id
          },

          data: {
            usageCount: {
              increment: 1
            }
          }
        });
      }

      return reservation;
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable
    }
  );
}