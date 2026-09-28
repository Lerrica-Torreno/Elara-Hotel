import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

function roundMoney(value) {
  return Math.round(
    Number(value) * 100
  ) / 100;
}

export async function validateDiscount(
  code,
  subtotal,
  onDate = new Date(),
  {
    customerVisibleOnly = true
  } = {}
) {
  if (!code) {
    return {
      discount: null,
      discountAmount: 0
    };
  }

  const normalizedCode =
    code
      .trim()
      .toUpperCase();

  const discount =
    await prisma.discount.findUnique({
      where: {
        code:
          normalizedCode
      }
    });

  if (
    !discount ||
    !discount.isActive
  ) {
    throw new HttpError(
      400,
      'Discount code is invalid.'
    );
  }

  if (
    customerVisibleOnly &&
    !discount.customerVisible
  ) {
    throw new HttpError(
      400,
      'Discount code is invalid.'
    );
  }

  if (
    discount.startDate &&
    onDate <
      discount.startDate
  ) {
    throw new HttpError(
      400,
      'Discount code is not yet valid.'
    );
  }

  if (
    discount.endDate &&
    onDate >
      discount.endDate
  ) {
    throw new HttpError(
      400,
      'Discount code has expired.'
    );
  }

  const normalizedSubtotal =
    Number(subtotal);

  const minimumAmount =
    Number(
      discount.minimumAmount ??
        0
    );

  if (
    normalizedSubtotal <
    minimumAmount
  ) {
    throw new HttpError(
      400,
      `A minimum spend of ${minimumAmount.toFixed(
        2
      )} is required for this discount.`
    );
  }

  let discountAmount =
    discount.type ===
    'PERCENTAGE'
      ? normalizedSubtotal *
        (
          Number(
            discount.value
          ) / 100
        )
      : Number(
          discount.value
        );

  discountAmount =
    Math.min(
      discountAmount,
      normalizedSubtotal
    );

  return {
    discount,

    discountAmount:
      roundMoney(
        discountAmount
      )
  };
}