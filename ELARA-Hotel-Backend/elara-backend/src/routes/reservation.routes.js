import { Router } from 'express';
import { z } from 'zod';

import {
  asyncHandler
} from '../utils/asyncHandler.js';

import {
  optionalAuth,
  requireAuth
} from '../middleware/auth.js';

import {
  createReservation
} from '../services/reservation.service.js';

import {
  prisma
} from '../config/prisma.js';

import {
  dateString
} from '../validators/common.js';

import {
  HttpError
} from '../utils/httpError.js';

const router = Router();

const createSchema =
  z.object({
    roomTypeId: z
      .string()
      .min(1),

    guestFirstName: z
      .string()
      .trim()
      .min(1)
      .max(80),

    guestLastName: z
      .string()
      .trim()
      .min(1)
      .max(80),

    guestEmail: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform(
        (value) =>
          value.toLowerCase()
      ),

    guestPhone: z
      .string()
      .trim()
      .max(30)
      .optional(),

    guestCount: z.coerce
      .number()
      .int()
      .min(1)
      .max(20),

    specialRequests: z
      .string()
      .trim()
      .max(1000)
      .optional(),

    checkInDate:
      dateString,

    checkOutDate:
      dateString,

    promoCode: z
      .string()
      .trim()
      .max(50)
      .optional(),

    discountCode: z
      .string()
      .trim()
      .max(50)
      .optional()
  })
  .refine(
    (input) =>
      !(
        input.promoCode &&
        input.discountCode
      ),
    {
      message:
        'A promotion and discount cannot be combined.',
      path: [
        'discountCode'
      ]
    }
  );

// ============================================================
// CREATE RESERVATION
// ============================================================

router.post(
  '/',

  optionalAuth,

  asyncHandler(
    async (req, res) => {
      const input =
        createSchema.parse(
          req.body
        );

      let customerProfileId =
        null;

      if (
        req.user?.role ===
        'CUSTOMER'
      ) {
        let profile =
          await prisma.customerProfile.findUnique({
            where: {
              userId:
                req.user.id
            }
          });

        if (!profile) {
          profile =
            await prisma.customerProfile.create({
              data: {
                userId:
                  req.user.id,

                phone:
                  input.guestPhone ||
                  null
              }
            });
        } else if (
          !profile.phone &&
          input.guestPhone
        ) {
          profile =
            await prisma.customerProfile.update({
              where: {
                id:
                  profile.id
              },

              data: {
                phone:
                  input.guestPhone
              }
            });
        }

        customerProfileId =
          profile.id;
      }

      if (
        !req.user
      ) {
        const existingUser =
          await prisma.user.findUnique({
            where: {
              email:
                input.guestEmail
            },

            include: {
              customerProfile:
                true
            }
          });

        if (
          existingUser?.role ===
          'CUSTOMER'
        ) {
          let profile =
            existingUser.customerProfile;

          if (!profile) {
            profile =
              await prisma.customerProfile.create({
                data: {
                  userId:
                    existingUser.id,

                  phone:
                    input.guestPhone ||
                    null
                }
              });
          } else if (
            !profile.phone &&
            input.guestPhone
          ) {
            profile =
              await prisma.customerProfile.update({
                where: {
                  id:
                    profile.id
                },

                data: {
                  phone:
                    input.guestPhone
                }
              });
          }

          customerProfileId =
            profile.id;
        }

        if (
          !existingUser
        ) {
          const customer =
            await prisma.$transaction(
              async (tx) => {
                const user =
                  await tx.user.create({
                    data: {
                      email:
                        input.guestEmail,

                      passwordHash:
                        null,

                      firstName:
                        input.guestFirstName,

                      lastName:
                        input.guestLastName,

                      role:
                        'CUSTOMER',

                      isActive:
                        true
                    }
                  });

                const profile =
                  await tx.customerProfile.create({
                    data: {
                      userId:
                        user.id,

                      phone:
                        input.guestPhone ||
                        null
                    }
                  });

                return {
                  user,
                  profile
                };
              }
            );

          customerProfileId =
            customer.profile.id;
        }
      }

      const reservation =
        await createReservation(
          input,
          customerProfileId,
          null
        );

      res
        .status(201)
        .json({
          reservation
        });
    }
  )
);

// ============================================================
// LOOKUP
// ============================================================

router.post(
  '/lookup',

  asyncHandler(
    async (req, res) => {
      const input =
        z.object({
          reference: z
            .string()
            .trim()
            .min(1),

          email: z
            .string()
            .trim()
            .email()
            .transform(
              (value) =>
                value.toLowerCase()
            )
        }).parse(
          req.body
        );

      const reservation =
        await prisma.reservation.findFirst({
          where: {
            reference:
              input.reference.toUpperCase(),

            guestEmail:
              input.email
          },

          include: {
            roomType:
              true,

            assignedRoom:
              true,

            payments:
              true,

            promotion:
              true,

            discount:
              true
          }
        });

      if (
        !reservation
      ) {
        throw new HttpError(
          404,
          'Reservation not found.'
        );
      }

      res.json({
        reservation
      });
    }
  )
);

// ============================================================
// MY RESERVATIONS
// ============================================================

router.get(
  '/mine',

  requireAuth,

  asyncHandler(
    async (req, res) => {
      if (
        req.user.role !==
        'CUSTOMER'
      ) {
        throw new HttpError(
          403,
          'Customer account required.'
        );
      }

      const profile =
        await prisma.customerProfile.findUnique({
          where: {
            userId:
              req.user.id
          }
        });

      const reservations =
        profile
          ? await prisma.reservation.findMany({
              where: {
                customerId:
                  profile.id
              },

              include: {
                roomType:
                  true,

                assignedRoom:
                  true,

                payments:
                  true,

                promotion:
                  true,

                discount:
                  true
              },

              orderBy: {
                createdAt:
                  'desc'
              }
            })
          : [];

      res.json({
        reservations
      });
    }
  )
);

// ============================================================
// CANCEL
// ============================================================

router.post(
  '/:id/cancel',

  optionalAuth,

  asyncHandler(
    async (req, res) => {
      const input =
        z.object({
          email: z
            .string()
            .trim()
            .email()
            .optional(),

          reason: z
            .string()
            .trim()
            .max(500)
            .optional()
        }).parse(
          req.body
        );

      const reservation =
        await prisma.reservation.findUnique({
          where: {
            id:
              req.params.id
          },

          include: {
            customer:
              true
          }
        });

      if (
        !reservation
      ) {
        throw new HttpError(
          404,
          'Reservation not found.'
        );
      }

      if (
        [
          'CHECKED_IN',
          'CHECKED_OUT',
          'CANCELLED'
        ].includes(
          reservation.status
        )
      ) {
        throw new HttpError(
          409,
          'This reservation cannot be cancelled.'
        );
      }

      let authorized =
        false;

      if (
        req.user?.role ===
          'CUSTOMER' &&
        reservation.customer
          ?.userId ===
          req.user.id
      ) {
        authorized =
          true;
      }

      if (
        req.user &&
        req.user.role !==
          'CUSTOMER'
      ) {
        authorized =
          true;
      }

      if (
        !req.user &&
        input.email
          ?.trim()
          .toLowerCase() ===
          reservation.guestEmail
      ) {
        authorized =
          true;
      }

      if (
        !authorized
      ) {
        throw new HttpError(
          403,
          'You are not authorized to cancel this reservation.'
        );
      }

      const updated =
        await prisma.reservation.update({
          where: {
            id:
              reservation.id
          },

          data: {
            status:
              'CANCELLED',

            cancelledAt:
              new Date(),

            cancellationReason:
              input.reason ||
              null
          }
        });

      res.json({
        reservation:
          updated
      });
    }
  )
);

export default router;