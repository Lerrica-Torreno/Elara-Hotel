import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  requireAuth,
  requireRoles,
  adminRoles
} from '../middleware/auth.js';

import { findOptimalRoom } from '../services/roomAssignment.service.js';
import { recordPayment } from '../services/payment.service.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

router.use(
  requireAuth,
  requireRoles(...adminRoles)
);

// ============================================================
// DASHBOARD
// ============================================================

router.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      activeBookings,
      revenue,
      pendingPayments,
      arrivalsToday,
      departuresToday
    ] = await Promise.all([
      prisma.room.count(),

      prisma.room.count({
        where: {
          status: 'AVAILABLE'
        }
      }),

      prisma.room.count({
        where: {
          status: 'OCCUPIED'
        }
      }),

      prisma.reservation.count({
        where: {
          status: {
            in: [
              'PENDING',
              'CONFIRMED',
              'CHECKED_IN'
            ]
          }
        }
      }),

      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          reservation: {
            status: {
              not: 'CANCELLED'
            }
          }
        },
        _sum: {
          amount: true
        }
      }),

      prisma.payment.aggregate({
        where: {
          status: 'PENDING',
          reservation: {
            status: {
              not: 'CANCELLED'
            }
          }
        },
        _sum: {
          amount: true
        }
      }),

      prisma.reservation.count({
        where: {
          checkInDate: {
            gte: start,
            lte: end
          },
          status: {
            in: [
              'CONFIRMED',
              'CHECKED_IN'
            ]
          }
        }
      }),

      prisma.reservation.count({
        where: {
          checkOutDate: {
            gte: start,
            lte: end
          },
          status: {
            in: [
              'CHECKED_IN',
              'CHECKED_OUT'
            ]
          }
        }
      })
    ]);

    res.json({
      metrics: {
        totalRevenue: Number(
          revenue._sum.amount ?? 0
        ),

        pendingPaymentAmount: Number(
          pendingPayments._sum.amount ?? 0
        ),

        activeBookings,

        occupancyRate:
          totalRooms
            ? Math.round(
                (occupiedRooms / totalRooms) *
                  10000
              ) / 100
            : 0,

        totalRooms,
        availableRooms,
        occupiedRooms,
        arrivalsToday,
        departuresToday
      }
    });
  })
);

// ============================================================
// ROOM TYPES
// ============================================================

router.get(
  '/room-types',
  asyncHandler(async (_req, res) => {
    const roomTypes =
      await prisma.roomType.findMany({
        orderBy: {
          name: 'asc'
        }
      });

    res.json({
      roomTypes
    });
  })
);

router.post(
  '/room-types',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        code: z
          .string()
          .trim()
          .min(1)
          .max(40),

        name: z
          .string()
          .trim()
          .min(1)
          .max(120),

        description: z
          .string()
          .trim()
          .max(1000)
          .optional(),

        capacity: z.coerce
          .number()
          .int()
          .min(1)
          .max(20),

        beds: z
          .string()
          .trim()
          .max(120)
          .optional(),

        baseRate: z.coerce
          .number()
          .nonnegative()
      })
      .parse(req.body);

    const roomType =
      await prisma.roomType.create({
        data: input
      });

    res.status(201).json({
      roomType
    });
  })
);

router.patch(
  '/room-types/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        code: z
          .string()
          .trim()
          .min(1)
          .max(40)
          .optional(),

        name: z
          .string()
          .trim()
          .min(1)
          .max(120)
          .optional(),

        description: z
          .string()
          .trim()
          .max(1000)
          .nullable()
          .optional(),

        capacity: z.coerce
          .number()
          .int()
          .min(1)
          .max(20)
          .optional(),

        beds: z
          .string()
          .trim()
          .max(120)
          .nullable()
          .optional(),

        baseRate: z.coerce
          .number()
          .nonnegative()
          .optional(),

        isActive: z
          .boolean()
          .optional()
      })
      .parse(req.body);

    const roomType =
      await prisma.roomType.update({
        where: {
          id: req.params.id
        },
        data: input
      });

    res.json({
      roomType
    });
  })
);

// ============================================================
// ROOMS
// ============================================================

router.get(
  '/rooms',
  asyncHandler(async (req, res) => {
    const status =
      req.query.status
        ? String(req.query.status)
        : undefined;

    const rooms =
      await prisma.room.findMany({
        where: status
          ? {
              status
            }
          : undefined,

        include: {
          roomType: true
        },

        orderBy: {
          roomNumber: 'asc'
        }
      });

    res.json({
      rooms
    });
  })
);

router.post(
  '/rooms',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        roomNumber: z
          .string()
          .trim()
          .min(1)
          .max(30),

        roomTypeId: z
          .string()
          .min(1),

        floor: z.coerce
          .number()
          .int()
          .optional(),

        status: z
          .enum([
            'AVAILABLE',
            'RESERVED',
            'OCCUPIED',
            'CLEANING',
            'MAINTENANCE',
            'OUT_OF_SERVICE'
          ])
          .default('AVAILABLE'),

        notes: z
          .string()
          .trim()
          .max(1000)
          .optional()
      })
      .parse(req.body);

    const room =
      await prisma.room.create({
        data: input,

        include: {
          roomType: true
        }
      });

    res.status(201).json({
      room
    });
  })
);

router.patch(
  '/rooms/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        roomTypeId: z
          .string()
          .min(1)
          .optional(),

        floor: z.coerce
          .number()
          .int()
          .nullable()
          .optional(),

        status: z
          .enum([
            'AVAILABLE',
            'RESERVED',
            'OCCUPIED',
            'CLEANING',
            'MAINTENANCE',
            'OUT_OF_SERVICE'
          ])
          .optional(),

        notes: z
          .string()
          .trim()
          .max(1000)
          .nullable()
          .optional()
      })
      .parse(req.body);

    const room =
      await prisma.room.update({
        where: {
          id: req.params.id
        },

        data: input,

        include: {
          roomType: true
        }
      });

    res.json({
      room
    });
  })
);

// ============================================================
// RESERVATIONS
// ============================================================

router.get(
  '/reservations',
  asyncHandler(async (req, res) => {
    const status =
      req.query.status
        ? String(req.query.status)
        : undefined;

    const q =
      req.query.q
        ? String(req.query.q).trim()
        : '';

    const reservations =
      await prisma.reservation.findMany({
        where: {
          ...(status
            ? {
                status
              }
            : {}),

          ...(q
            ? {
                OR: [
                  {
                    reference: {
                      contains: q,
                      mode: 'insensitive'
                    }
                  },

                  {
                    guestFirstName: {
                      contains: q,
                      mode: 'insensitive'
                    }
                  },

                  {
                    guestLastName: {
                      contains: q,
                      mode: 'insensitive'
                    }
                  },

                  {
                    guestEmail: {
                      contains: q,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            : {})
        },

        include: {
          roomType: true,
          assignedRoom: true,
          payments: true,
          promotion: true
        },

        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      reservations
    });
  })
);

router.post(
  '/reservations/:id/assign-optimal',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const room =
      await findOptimalRoom(
        req.params.id
      );

    if (!room) {
      throw new HttpError(
        409,
        'No suitable available room found.'
      );
    }

    const reservation =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.reservation.update({
              where: {
                id: req.params.id
              },

              data: {
                assignedRoomId:
                  room.id
              }
            });

          await tx.room.update({
            where: {
              id: room.id
            },

            data: {
              status: 'RESERVED'
            }
          });

          return updated;
        }
      );

    res.json({
      reservation,
      room
    });
  })
);

router.post(
  '/reservations/:id/check-in',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: req.params.id
        }
      });

    if (!reservation) {
      throw new HttpError(
        404,
        'Reservation not found.'
      );
    }

    if (
      !reservation.assignedRoomId
    ) {
      throw new HttpError(
        409,
        'Assign a room before check-in.'
      );
    }

    if (
      reservation.status !==
      'CONFIRMED'
    ) {
      throw new HttpError(
        409,
        'Only confirmed reservations can be checked in.'
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedReservation =
            await tx.reservation.update({
              where: {
                id: reservation.id
              },

              data: {
                status: 'CHECKED_IN',
                checkedInAt:
                  new Date()
              }
            });

          const room =
            await tx.room.update({
              where: {
                id:
                  reservation.assignedRoomId
              },

              data: {
                status: 'OCCUPIED'
              }
            });

          return {
            reservation:
              updatedReservation,
            room
          };
        }
      );

    res.json(result);
  })
);

router.post(
  '/reservations/:id/check-out',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: req.params.id
        }
      });

    if (!reservation) {
      throw new HttpError(
        404,
        'Reservation not found.'
      );
    }

    if (
      reservation.status !==
      'CHECKED_IN'
    ) {
      throw new HttpError(
        409,
        'Only checked-in reservations can be checked out.'
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedReservation =
            await tx.reservation.update({
              where: {
                id: reservation.id
              },

              data: {
                status: 'CHECKED_OUT',
                checkedOutAt:
                  new Date()
              }
            });

          let room = null;

          if (
            reservation.assignedRoomId
          ) {
            room =
              await tx.room.update({
                where: {
                  id:
                    reservation.assignedRoomId
                },

                data: {
                  status: 'CLEANING'
                }
              });

            await tx.housekeepingTask.create({
              data: {
                roomId:
                  reservation.assignedRoomId,

                status: 'PENDING',
                priority: 'NORMAL',

                notes:
                  `Turnover after ${reservation.reference}`
              }
            });
          }

          return {
            reservation:
              updatedReservation,
            room
          };
        }
      );

    res.json(result);
  })
);

// ============================================================
// CUSTOMERS
// ============================================================

router.get(
  '/customers',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const search =
      String(
        req.query.search ??
          ''
      ).trim();

    const customers =
      await prisma.customerProfile.findMany({
        where: search
          ? {
              OR: [
                {
                  user: {
                    firstName: {
                      contains:
                        search,
                      mode:
                        'insensitive'
                    }
                  }
                },

                {
                  user: {
                    lastName: {
                      contains:
                        search,
                      mode:
                        'insensitive'
                    }
                  }
                },

                {
                  user: {
                    email: {
                      contains:
                        search,
                      mode:
                        'insensitive'
                    }
                  }
                },

                {
                  phone: {
                    contains:
                      search,
                    mode:
                      'insensitive'
                  }
                },

                {
                  address: {
                    contains:
                      search,
                    mode:
                      'insensitive'
                  }
                }
              ]
            }
          : undefined,

        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
              createdAt: true
            }
          },

          reservations: {
            select: {
              id: true,
              reference: true,
              status: true,
              checkInDate: true,
              checkOutDate: true,
              totalAmount: true,
              createdAt: true,

              roomType: {
                select: {
                  name: true
                }
              }
            },

            orderBy: {
              createdAt: 'desc'
            }
          }
        },

        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      customers
    });
  })
);

router.post(
  '/customers',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        firstName: z
          .string()
          .trim()
          .min(1)
          .max(120),

        lastName: z
          .string()
          .trim()
          .min(1)
          .max(120),

        email: z
          .string()
          .trim()
          .email()
          .transform(
            (value) =>
              value.toLowerCase()
          ),

        phone: z
          .string()
          .trim()
          .max(50)
          .optional(),

        address: z
          .string()
          .trim()
          .max(500)
          .optional(),

        notes: z
          .string()
          .trim()
          .max(1000)
          .optional()
      })
      .parse(req.body);

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: input.email
        },

        include: {
          customerProfile:
            true
        }
      });

    if (
      existingUser
        ?.customerProfile
    ) {
      throw new HttpError(
        409,
        'A customer with this email already exists.'
      );
    }

    if (
      existingUser &&
      existingUser.role !==
        'CUSTOMER'
    ) {
      throw new HttpError(
        409,
        'This email already belongs to a staff account.'
      );
    }

    const customer =
      await prisma.$transaction(
        async (tx) => {
          let user =
            existingUser;

          if (!user) {
            user =
              await tx.user.create({
                data: {
                  email:
                    input.email,

                  passwordHash:
                    null,

                  firstName:
                    input.firstName,

                  lastName:
                    input.lastName,

                  role:
                    'CUSTOMER',

                  isActive:
                    true
                }
              });
          } else {
            user =
              await tx.user.update({
                where: {
                  id: user.id
                },

                data: {
                  firstName:
                    input.firstName,

                  lastName:
                    input.lastName
                }
              });
          }

          return tx.customerProfile.create({
            data: {
              userId:
                user.id,

              phone:
                input.phone ||
                null,

              address:
                input.address ||
                null,

              notes:
                input.notes ||
                null
            },

            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  isActive: true,
                  createdAt: true
                }
              },

              reservations: {
                select: {
                  id: true,
                  reference: true,
                  status: true,
                  checkInDate: true,
                  checkOutDate: true,
                  totalAmount: true,
                  createdAt: true,

                  roomType: {
                    select: {
                      name: true
                    }
                  }
                },

                orderBy: {
                  createdAt: 'desc'
                }
              }
            }
          });
        }
      );

    res.status(201).json({
      customer
    });
  })
);

router.patch(
  '/customers/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        firstName: z
          .string()
          .trim()
          .min(1)
          .max(120)
          .optional(),

        lastName: z
          .string()
          .trim()
          .min(1)
          .max(120)
          .optional(),

        email: z
          .string()
          .trim()
          .email()
          .transform(
            (value) =>
              value.toLowerCase()
          )
          .optional(),

        phone: z
          .string()
          .trim()
          .max(50)
          .nullable()
          .optional(),

        address: z
          .string()
          .trim()
          .max(500)
          .nullable()
          .optional(),

        notes: z
          .string()
          .trim()
          .max(1000)
          .nullable()
          .optional(),

        isActive: z
          .boolean()
          .optional()
      })
      .parse(req.body);

    const existing =
      await prisma.customerProfile.findUnique({
        where: {
          id: req.params.id
        },

        include: {
          user: true
        }
      });

    if (!existing) {
      throw new HttpError(
        404,
        'Customer not found.'
      );
    }

    if (
      input.email &&
      input.email !==
        existing.user.email
    ) {
      const duplicateUser =
        await prisma.user.findUnique({
          where: {
            email:
              input.email
          }
        });

      if (duplicateUser) {
        throw new HttpError(
          409,
          'That email address is already in use.'
        );
      }
    }

    const customer =
      await prisma.$transaction(
        async (tx) => {
          const userData = {};

          if (
            input.firstName !==
            undefined
          ) {
            userData.firstName =
              input.firstName;
          }

          if (
            input.lastName !==
            undefined
          ) {
            userData.lastName =
              input.lastName;
          }

          if (
            input.email !==
            undefined
          ) {
            userData.email =
              input.email;
          }

          if (
            input.isActive !==
            undefined
          ) {
            userData.isActive =
              input.isActive;
          }

          if (
            Object.keys(userData)
              .length > 0
          ) {
            await tx.user.update({
              where: {
                id:
                  existing.userId
              },

              data:
                userData
            });
          }

          const profileData = {};

          if (
            input.phone !==
            undefined
          ) {
            profileData.phone =
              input.phone ||
              null;
          }

          if (
            input.address !==
            undefined
          ) {
            profileData.address =
              input.address ||
              null;
          }

          if (
            input.notes !==
            undefined
          ) {
            profileData.notes =
              input.notes ||
              null;
          }

          return tx.customerProfile.update({
            where: {
              id:
                req.params.id
            },

            data:
              profileData,

            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  isActive: true,
                  createdAt: true
                }
              },

              reservations: {
                select: {
                  id: true,
                  reference: true,
                  status: true,
                  checkInDate: true,
                  checkOutDate: true,
                  totalAmount: true,
                  createdAt: true,

                  roomType: {
                    select: {
                      name: true
                    }
                  }
                },

                orderBy: {
                  createdAt: 'desc'
                }
              }
            }
          });
        }
      );

    res.json({
      customer
    });
  })
);

// ============================================================
// PAYMENTS
// ============================================================

router.get(
  '/payments',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const status =
      req.query.status
        ? String(
            req.query.status
          )
        : undefined;

    const q =
      req.query.q
        ? String(
            req.query.q
          ).trim()
        : '';

    const validStatuses = [
      'PENDING',
      'PAID',
      'PARTIALLY_PAID',
      'REFUNDED',
      'FAILED'
    ];

    if (
      status &&
      !validStatuses.includes(
        status
      )
    ) {
      throw new HttpError(
        400,
        'Invalid payment status.'
      );
    }

    const payments =
      await prisma.payment.findMany({
        where: {
          ...(status
            ? {
                status
              }
            : {}),

          ...(q
            ? {
                OR: [
                  {
                    reference: {
                      contains: q,
                      mode:
                        'insensitive'
                    }
                  },

                  {
                    provider: {
                      contains: q,
                      mode:
                        'insensitive'
                    }
                  },

                  {
                    providerRef: {
                      contains: q,
                      mode:
                        'insensitive'
                    }
                  },

                  {
                    reservation: {
                      is: {
                        reference: {
                          contains:
                            q,

                          mode:
                            'insensitive'
                        }
                      }
                    }
                  },

                  {
                    reservation: {
                      is: {
                        guestFirstName: {
                          contains:
                            q,

                          mode:
                            'insensitive'
                        }
                      }
                    }
                  },

                  {
                    reservation: {
                      is: {
                        guestLastName: {
                          contains:
                            q,

                          mode:
                            'insensitive'
                        }
                      }
                    }
                  },

                  {
                    reservation: {
                      is: {
                        guestEmail: {
                          contains:
                            q,

                          mode:
                            'insensitive'
                        }
                      }
                    }
                  }
                ]
              }
            : {})
        },

        include: {
          reservation: {
            include: {
              roomType: true,
              assignedRoom: true
            }
          }
        },

        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      payments
    });
  })
);

router.post(
  '/payments',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        reservationId: z
          .string()
          .min(1),

        amount: z.coerce
          .number()
          .positive(),

        method: z.enum([
          'CARD',
          'GCASH',
          'EWALLET',
          'BANK_TRANSFER',
          'CASH'
        ]),

        status: z
          .enum([
            'PENDING',
            'PAID',
            'PARTIALLY_PAID'
          ])
          .default(
            'PENDING'
          ),

        provider: z
          .string()
          .trim()
          .max(120)
          .nullable()
          .optional(),

        providerRef: z
          .string()
          .trim()
          .max(200)
          .nullable()
          .optional()
      })
      .parse(req.body);

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id:
            input.reservationId
        },

        include: {
          payments: true,
          roomType: true,
          assignedRoom: true
        }
      });

    if (!reservation) {
      throw new HttpError(
        404,
        'Reservation not found.'
      );
    }

    if (
      reservation.status ===
      'CANCELLED'
    ) {
      throw new HttpError(
        409,
        'Payments cannot be recorded for a cancelled reservation.'
      );
    }

    const totalAmount =
      Number(
        reservation.totalAmount
      );

    if (
      input.amount >
      totalAmount
    ) {
      throw new HttpError(
        409,
        'Payment amount cannot exceed the reservation total.'
      );
    }

    const successfulPayments =
      reservation.payments.filter(
        (payment) =>
          payment.status ===
            'PAID' ||
          payment.status ===
            'PARTIALLY_PAID'
      );

    const alreadyPaid =
      successfulPayments.reduce(
        (
          total,
          payment
        ) =>
          total +
          Number(
            payment.amount
          ),
        0
      );

    const outstanding =
      Math.max(
        totalAmount -
          alreadyPaid,
        0
      );

    if (
      (
        input.status ===
          'PAID' ||
        input.status ===
          'PARTIALLY_PAID'
      ) &&
      input.amount >
        outstanding
    ) {
      throw new HttpError(
        409,
        `Payment exceeds the outstanding balance of ${outstanding.toFixed(2)}.`
      );
    }

    if (
      (
        input.status ===
          'PAID' ||
        input.status ===
          'PARTIALLY_PAID'
      ) &&
      outstanding <= 0
    ) {
      throw new HttpError(
        409,
        'This reservation is already fully paid.'
      );
    }

    const payment =
      await prisma.$transaction(
        async (tx) => {
          const savedPayment =
            await recordPayment(
              tx,
              {
                reservationId:
                  input.reservationId,

                amount:
                  input.amount,

                method:
                  input.method,

                status:
                  input.status,

                provider:
                  input.provider,

                providerRef:
                  input.providerRef,

                paidAt:
                  input.status ===
                    'PAID' ||
                  input.status ===
                    'PARTIALLY_PAID'
                    ? new Date()
                    : null
              }
            );

          return tx.payment.findUnique({
            where: {
              id:
                savedPayment.id
            },
            include: {
              reservation: {
                include: {
                  roomType: true,
                  assignedRoom: true
                }
              }
            }
          });
        }
      );

    res.status(201).json({
      payment
    });
  })
);

// ============================================================
// PRICING RULES
// ============================================================

router.get(
  '/pricing-rules',
  asyncHandler(async (_req, res) => {
    const pricingRules =
      await prisma.pricingRule.findMany({
        include: {
          roomType: true
        },

        orderBy: [
          {
            priority: 'asc'
          },

          {
            createdAt: 'desc'
          }
        ]
      });

    res.json({
      pricingRules
    });
  })
);

router.post(
  '/pricing-rules',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        name: z
          .string()
          .trim()
          .min(1)
          .max(120),

        type: z.enum([
          'WEEKEND',
          'OCCUPANCY',
          'SEASON',
          'HOLIDAY',
          'HISTORICAL_DEMAND',
          'ROOM_TYPE',
          'LEAD_TIME'
        ]),

        roomTypeId: z
          .string()
          .nullable()
          .optional(),

        priority: z.coerce
          .number()
          .int()
          .default(100),

        isActive: z
          .boolean()
          .default(true),

        startDate: z
          .string()
          .optional(),

        endDate: z
          .string()
          .optional(),

        dayOfWeek: z.coerce
          .number()
          .int()
          .min(0)
          .max(6)
          .nullable()
          .optional(),

        minOccupancy: z.coerce
          .number()
          .min(0)
          .max(100)
          .nullable()
          .optional(),

        maxOccupancy: z.coerce
          .number()
          .min(0)
          .max(100)
          .nullable()
          .optional(),

        minLeadDays: z.coerce
          .number()
          .int()
          .min(0)
          .nullable()
          .optional(),

        maxLeadDays: z.coerce
          .number()
          .int()
          .min(0)
          .nullable()
          .optional(),

        demandLevel: z
          .string()
          .max(40)
          .nullable()
          .optional(),

        fixedRate: z.coerce
          .number()
          .nonnegative()
          .nullable()
          .optional(),

        adjustmentPct: z.coerce
          .number()
          .nullable()
          .optional(),

        adjustmentAmt: z.coerce
          .number()
          .nullable()
          .optional()
      })
      .parse(req.body);

    const pricingRule =
      await prisma.pricingRule.create({
        data: {
          ...input,

          startDate:
            input.startDate
              ? new Date(
                  `${input.startDate}T00:00:00.000Z`
                )
              : null,

          endDate:
            input.endDate
              ? new Date(
                  `${input.endDate}T00:00:00.000Z`
                )
              : null
        }
      });

    res.status(201).json({
      pricingRule
    });
  })
);

router.patch(
  '/pricing-rules/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        name: z
          .string()
          .trim()
          .min(1)
          .max(120)
          .optional(),

        priority: z.coerce
          .number()
          .int()
          .optional(),

        isActive: z
          .boolean()
          .optional(),

        fixedRate: z.coerce
          .number()
          .nonnegative()
          .nullable()
          .optional(),

        adjustmentPct: z.coerce
          .number()
          .nullable()
          .optional(),

        adjustmentAmt: z.coerce
          .number()
          .nullable()
          .optional()
      })
      .parse(req.body);

    const pricingRule =
      await prisma.pricingRule.update({
        where: {
          id:
            req.params.id
        },

        data: input
      });

    res.json({
      pricingRule
    });
  })
);

router.delete(
  '/pricing-rules/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    await prisma.pricingRule.delete({
      where: {
        id:
          req.params.id
      }
    });

    res.status(204).end();
  })
);

// ============================================================
// PROMOTIONS
// ============================================================

router.get(
  '/promotions',

  asyncHandler(async (_req, res) => {
    const promotions =
      await prisma.promotion.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      promotions
    });
  })
);

router.post(
  '/promotions',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        code: z
          .string()
          .trim()
          .min(1)
          .max(50)
          .transform(
            (value) =>
              value.toUpperCase()
          ),

        name: z
          .string()
          .trim()
          .min(1)
          .max(120),

        description: z
          .string()
          .trim()
          .max(500)
          .optional(),

        type: z.enum([
          'PERCENTAGE',
          'FIXED_AMOUNT'
        ]),

        value: z.coerce
          .number()
          .positive(),

        minSpend: z.coerce
          .number()
          .nonnegative()
          .nullable()
          .optional(),

        maxDiscount: z.coerce
          .number()
          .nonnegative()
          .nullable()
          .optional(),

        startDate: z.string(),

        endDate: z.string(),

        usageLimit: z.coerce
          .number()
          .int()
          .positive()
          .nullable()
          .optional(),

        isActive: z
          .boolean()
          .default(true)
      })
      .parse(req.body);

    const promotion =
      await prisma.promotion.create({
        data: {
          ...input,

          startDate:
            new Date(
              `${input.startDate}T00:00:00.000Z`
            ),

          endDate:
            new Date(
              `${input.endDate}T00:00:00.000Z`
            )
        }
      });

    res.status(201).json({
      promotion
    });
  })
);

router.patch(
  '/promotions/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        name: z
          .string()
          .trim()
          .min(1)
          .optional(),

        isActive: z
          .boolean()
          .optional(),

        usageLimit: z.coerce
          .number()
          .int()
          .positive()
          .nullable()
          .optional()
      })
      .parse(req.body);

    const promotion =
      await prisma.promotion.update({
        where: {
          id:
            req.params.id
        },

        data: input
      });

    res.json({
      promotion
    });
  })
);

// ============================================================
// DISCOUNTS
// ============================================================

router.get(
  '/discounts',

  asyncHandler(async (_req, res) => {
    const discounts =
      await prisma.discount.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      discounts
    });
  })
);

router.post(
  '/discounts',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        code: z
          .string()
          .trim()
          .min(1)
          .max(50)
          .transform(
            (value) =>
              value.toUpperCase()
          ),

        name: z
          .string()
          .trim()
          .min(1)
          .max(120),

        description: z
          .string()
          .trim()
          .max(500)
          .optional(),

        type: z.enum([
          'PERCENTAGE',
          'FIXED_AMOUNT'
        ]),

        value: z.coerce
          .number()
          .positive(),

        minimumAmount: z.coerce
          .number()
          .nonnegative()
          .nullable()
          .optional(),

        startDate: z
          .string()
          .nullable()
          .optional(),

        endDate: z
          .string()
          .nullable()
          .optional(),

        isActive: z
          .boolean()
          .default(true),

        customerVisible: z
          .boolean()
          .default(true)
      })
      .parse(req.body);

    const discount =
      await prisma.discount.create({
        data: {
          ...input,

          startDate:
            input.startDate
              ? new Date(
                  `${input.startDate}T00:00:00.000Z`
                )
              : null,

          endDate:
            input.endDate
              ? new Date(
                  `${input.endDate}T00:00:00.000Z`
                )
              : null
        }
      });

    res.status(201).json({
      discount
    });
  })
);

router.patch(
  '/discounts/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        code: z
          .string()
          .trim()
          .min(1)
          .max(50)
          .transform(
            (value) =>
              value.toUpperCase()
          )
          .optional(),

        name: z
          .string()
          .trim()
          .min(1)
          .max(120)
          .optional(),

        description: z
          .string()
          .trim()
          .max(500)
          .nullable()
          .optional(),

        type: z
          .enum([
            'PERCENTAGE',
            'FIXED_AMOUNT'
          ])
          .optional(),

        value: z.coerce
          .number()
          .positive()
          .optional(),

        minimumAmount: z.coerce
          .number()
          .nonnegative()
          .nullable()
          .optional(),

        startDate: z
          .string()
          .nullable()
          .optional(),

        endDate: z
          .string()
          .nullable()
          .optional(),

        isActive: z
          .boolean()
          .optional(),

        customerVisible: z
          .boolean()
          .optional()
      })
      .parse(req.body);

    const data = {
      ...input
    };

    if (
      Object.prototype.hasOwnProperty.call(
        input,
        'startDate'
      )
    ) {
      data.startDate =
        input.startDate
          ? new Date(
              `${input.startDate}T00:00:00.000Z`
            )
          : null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        input,
        'endDate'
      )
    ) {
      data.endDate =
        input.endDate
          ? new Date(
              `${input.endDate}T00:00:00.000Z`
            )
          : null;
    }

    const discount =
      await prisma.discount.update({
        where: {
          id:
            req.params.id
        },

        data
      });

    res.json({
      discount
    });
  })
);

router.delete(
  '/discounts/:id',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(async (req, res) => {
    await prisma.discount.delete({
      where: {
        id:
          req.params.id
      }
    });

    res.status(204).end();
  })
);

// ============================================================
// HOUSEKEEPING
// ============================================================

router.get(
  '/housekeeping',

  asyncHandler(async (_req, res) => {
    const tasks =
      await prisma.housekeepingTask.findMany({
        include: {
          room: {
            include: {
              roomType: true
            }
          },

          assignedTo: true
        },

        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      tasks
    });
  })
);

router.post(
  '/housekeeping',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK',
    'HOUSEKEEPING'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        roomId: z
          .string()
          .min(1),

        assignedToId: z
          .string()
          .nullable()
          .optional(),

        priority: z
          .enum([
            'LOW',
            'NORMAL',
            'HIGH',
            'URGENT'
          ])
          .default('NORMAL'),

        notes: z
          .string()
          .trim()
          .max(1000)
          .optional()
      })
      .parse(req.body);

    const task =
      await prisma.$transaction(
        async (tx) => {
          await tx.room.update({
            where: {
              id:
                input.roomId
            },

            data: {
              status:
                'CLEANING'
            }
          });

          return tx.housekeepingTask.create({
            data: input
          });
        }
      );

    res.status(201).json({
      task
    });
  })
);

router.post(
  '/housekeeping/:id/complete',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'HOUSEKEEPING'
  ),

  asyncHandler(async (req, res) => {
    const task =
      await prisma.housekeepingTask.findUnique({
        where: {
          id: req.params.id
        }
      });

    if (!task) {
      throw new HttpError(
        404,
        'Housekeeping task not found.'
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedTask =
            await tx.housekeepingTask.update({
              where: {
                id: task.id
              },

              data: {
                status:
                  'COMPLETED',

                completedAt:
                  new Date()
              }
            });

          const room =
            await tx.room.update({
              where: {
                id:
                  task.roomId
              },

              data: {
                status:
                  'AVAILABLE'
              }
            });

          return {
            task:
              updatedTask,
            room
          };
        }
      );

    res.json(result);
  })
);

// ============================================================
// MAINTENANCE
// ============================================================

router.get(
  '/maintenance',

  asyncHandler(async (_req, res) => {
    const tickets =
      await prisma.maintenanceTicket.findMany({
        include: {
          room: {
            include: {
              roomType: true
            }
          },

          assignedTo: true
        },

        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      tickets
    });
  })
);

router.post(
  '/maintenance',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'FRONT_DESK',
    'MAINTENANCE'
  ),

  asyncHandler(async (req, res) => {
    const input = z
      .object({
        roomId: z
          .string()
          .min(1),

        assignedToId: z
          .string()
          .nullable()
          .optional(),

        title: z
          .string()
          .trim()
          .min(1)
          .max(150),

        description: z
          .string()
          .trim()
          .max(2000)
          .optional(),

        priority: z
          .enum([
            'LOW',
            'NORMAL',
            'HIGH',
            'URGENT'
          ])
          .default('NORMAL')
      })
      .parse(req.body);

    const ticket =
      await prisma.$transaction(
        async (tx) => {
          await tx.room.update({
            where: {
              id:
                input.roomId
            },

            data: {
              status:
                'MAINTENANCE'
            }
          });

          return tx.maintenanceTicket.create({
            data: input
          });
        }
      );

    res.status(201).json({
      ticket
    });
  })
);

router.post(
  '/maintenance/:id/resolve',

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN',
    'MAINTENANCE'
  ),

  asyncHandler(async (req, res) => {
    const ticket =
      await prisma.maintenanceTicket.findUnique({
        where: {
          id: req.params.id
        }
      });

    if (!ticket) {
      throw new HttpError(
        404,
        'Maintenance ticket not found.'
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedTicket =
            await tx.maintenanceTicket.update({
              where: {
                id:
                  ticket.id
              },

              data: {
                status:
                  'COMPLETED',

                resolvedAt:
                  new Date()
              }
            });

          const room =
            await tx.room.update({
              where: {
                id:
                  ticket.roomId
              },

              data: {
                status:
                  'CLEANING'
              }
            });

          await tx.housekeepingTask.create({
            data: {
              roomId:
                ticket.roomId,

              priority:
                'NORMAL',

              status:
                'PENDING',

              notes:
                'Post-maintenance room cleaning.'
            }
          });

          return {
            ticket:
              updatedTicket,
            room
          };
        }
      );

    res.json(result);
  })
);

export default router;