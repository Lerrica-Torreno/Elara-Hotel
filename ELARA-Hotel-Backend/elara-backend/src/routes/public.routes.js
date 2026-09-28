import { Router } from 'express';
import { z } from 'zod';

import {
  asyncHandler
} from '../utils/asyncHandler.js';

import {
  dateString
} from '../validators/common.js';

import {
  getAvailableRoomTypeQuotes,
  calculateRate
} from '../services/pricing.service.js';

import {
  validatePromotion
} from '../services/promotion.service.js';

import {
  validateDiscount
} from '../services/discount.service.js';

import {
  prisma
} from '../config/prisma.js';

const router = Router();

// ============================================================
// ROOM TYPES
// ============================================================

router.get(
  '/room-types',

  asyncHandler(
    async (_req, res) => {
      const roomTypes =
        await prisma.roomType.findMany({
          where: {
            isActive:
              true
          },

          orderBy: {
            baseRate:
              'asc'
          }
        });

      res.json({
        roomTypes
      });
    }
  )
);

// ============================================================
// AVAILABILITY
// ============================================================

router.get(
  '/availability',

  asyncHandler(
    async (req, res) => {
      const input =
        z.object({
          checkIn:
            dateString,

          checkOut:
            dateString,

          guests:
            z.coerce
              .number()
              .int()
              .min(1)
              .max(20)
        }).parse(
          req.query
        );

      const checkInDate =
        new Date(
          `${input.checkIn}T00:00:00.000Z`
        );

      const checkOutDate =
        new Date(
          `${input.checkOut}T00:00:00.000Z`
        );

      if (
        checkOutDate <=
        checkInDate
      ) {
        return res
          .status(400)
          .json({
            message:
              'Check-out must be after check-in.'
          });
      }

      const roomTypes =
        await getAvailableRoomTypeQuotes({
          checkInDate,
          checkOutDate,
          guests:
            input.guests
        });

      res.json({
        checkIn:
          input.checkIn,

        checkOut:
          input.checkOut,

        guests:
          input.guests,

        roomTypes
      });
    }
  )
);

// ============================================================
// PRICING QUOTE
// ============================================================

router.get(
  '/pricing/quote',

  asyncHandler(
    async (req, res) => {
      const input =
        z.object({
          roomTypeId:
            z.string()
              .min(1),

          checkIn:
            dateString,

          checkOut:
            dateString
        }).parse(
          req.query
        );

      const quote =
        await calculateRate({
          roomTypeId:
            input.roomTypeId,

          checkInDate:
            new Date(
              `${input.checkIn}T00:00:00.000Z`
            ),

          checkOutDate:
            new Date(
              `${input.checkOut}T00:00:00.000Z`
            )
        });

      if (!quote) {
        return res
          .status(404)
          .json({
            message:
              'Room type not found.'
          });
      }

      res.json(
        quote
      );
    }
  )
);

// ============================================================
// VALIDATE PROMOTION
// ============================================================

router.post(
  '/promotions/validate',

  asyncHandler(
    async (req, res) => {
      const input =
        z.object({
          code:
            z.string()
              .trim()
              .min(1),

          subtotal:
            z.coerce
              .number()
              .positive()
        }).parse(
          req.body
        );

      const result =
        await validatePromotion(
          input.code,
          input.subtotal
        );

      res.json({
        valid:
          true,

        promotion:
          result.promotion
            ? {
                code:
                  result.promotion
                    .code,

                name:
                  result.promotion
                    .name,

                type:
                  result.promotion
                    .type,

                value:
                  Number(
                    result.promotion
                      .value
                  )
              }
            : null,

        discountAmount:
          result.discountAmount
      });
    }
  )
);

// ============================================================
// VALIDATE DISCOUNT
// ============================================================

router.post(
  '/discounts/validate',

  asyncHandler(
    async (req, res) => {
      const input =
        z.object({
          code:
            z.string()
              .trim()
              .min(1),

          subtotal:
            z.coerce
              .number()
              .positive()
        }).parse(
          req.body
        );

      const result =
        await validateDiscount(
          input.code,
          input.subtotal,
          new Date(),
          {
            customerVisibleOnly:
              true
          }
        );

      res.json({
        valid:
          true,

        discount:
          result.discount
            ? {
                code:
                  result.discount
                    .code,

                name:
                  result.discount
                    .name,

                type:
                  result.discount
                    .type,

                value:
                  Number(
                    result.discount
                      .value
                  )
              }
            : null,

        discountAmount:
          result.discountAmount
      });
    }
  )
);

export default router;