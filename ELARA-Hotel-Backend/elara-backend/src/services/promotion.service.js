import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

function roundMoney(value) {
  // Keep computed promotion savings aligned with the currency's two decimal places.
  return Math.round(
    Number(value) * 100
  ) / 100;
}

export async function validatePromotion(
  code,
  subtotal,
  onDate = new Date()
) {
  // Enforce promotion dates, usage limits, and minimum spend before computing savings.
  if (!code) {
    return {
      promotion: null,
      discountAmount: 0
    };
  }

  const normalizedCode =
    code
      .trim()
      .toUpperCase();

  const promotion =
    await prisma.promotion.findUnique({
      where: {
        code: normalizedCode
      }
    });

  if (
    !promotion ||
    !promotion.isActive
  ) {
    throw new HttpError(
      400,
      'Promotion code is invalid.'
    );
  }

  if (
    onDate <
      promotion.startDate ||
    onDate >
      promotion.endDate
  ) {
    throw new HttpError(
      400,
      'Promotion code is not currently valid.'
    );
  }

  if (
    promotion.usageLimit !=
      null &&
    promotion.usageCount >=
      promotion.usageLimit
  ) {
    throw new HttpError(
      400,
      'Promotion usage limit has been reached.'
    );
  }

  const normalizedSubtotal =
    Number(subtotal);

  const minSpend =
    Number(
      promotion.minSpend ??
        0
    );

  if (
    normalizedSubtotal <
    minSpend
  ) {
    throw new HttpError(
      400,
      `A minimum spend of ${minSpend.toFixed(
        2
      )} is required for this promotion.`
    );
  }

  let discountAmount =
    promotion.type ===
    'PERCENTAGE'
      ? normalizedSubtotal *
        (
          Number(
            promotion.value
          ) / 100
        )
      : Number(
          promotion.value
        );

  if (
    promotion.maxDiscount !=
    null
  ) {
    discountAmount =
      Math.min(
        discountAmount,
        Number(
          promotion.maxDiscount
        )
      );
  }

  discountAmount =
    Math.min(
      discountAmount,
      normalizedSubtotal
    );

  return {
    promotion,

    discountAmount:
      roundMoney(
        discountAmount
      )
  };
}