import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import {
  asyncHandler
} from '../utils/asyncHandler.js';

import {
  requireAuth,
  requireRoles
} from '../middleware/auth.js';

import {
  authenticate,
  bootstrapAdmin,
  clearAuthCookie,
  createCustomer,
  issueToken,
  publicUser,
  setAuthCookie
} from '../services/auth.service.js';

import {
  prisma
} from '../config/prisma.js';

import {
  emailSchema,
  passwordSchema
} from '../validators/common.js';

const router = Router();

const registerSchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1)
      .max(80),

    lastName: z
      .string()
      .trim()
      .min(1)
      .max(80),

    email:
      emailSchema,

    phone: z
      .string()
      .trim()
      .max(30)
      .optional(),

    password:
      passwordSchema
  });

const loginSchema =
  z.object({
    email:
      emailSchema,

    password: z
      .string()
      .min(1)
      .max(128)
  });

// ============================================================
// CUSTOMER REGISTER
// ============================================================

router.post(
  '/customer/register',

  asyncHandler(
    async (req, res) => {
      const input =
        registerSchema.parse(
          req.body
        );

      const normalizedEmail =
        input.email
          .trim()
          .toLowerCase();

      /*
        Anonymous reservations can create a CUSTOMER
        account shell with passwordHash = null.

        If that guest later registers, we claim/upgrade
        the existing account instead of rejecting it.
      */
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email:
              normalizedEmail
          },

          include: {
            customerProfile:
              true
          }
        });

      let user;

      if (
        existingUser
      ) {
        /*
          Staff accounts cannot be converted into
          customer accounts.
        */
        if (
          existingUser.role !==
          'CUSTOMER'
        ) {
          return res
            .status(409)
            .json({
              message:
                'Email already exists.'
            });
        }

        /*
          A real registered customer already has
          a password.
        */
        if (
          existingUser.passwordHash
        ) {
          return res
            .status(409)
            .json({
              message:
                'Email already exists.'
            });
        }

        const passwordHash =
          await bcrypt.hash(
            input.password,
            12
          );

        user =
          await prisma.$transaction(
            async (tx) => {
              const updatedUser =
                await tx.user.update({
                  where: {
                    id:
                      existingUser.id
                  },

                  data: {
                    email:
                      normalizedEmail,

                    passwordHash,

                    firstName:
                      input.firstName,

                    lastName:
                      input.lastName,

                    isActive:
                      true
                  }
                });

              if (
                existingUser.customerProfile
              ) {
                await tx.customerProfile.update({
                  where: {
                    id:
                      existingUser
                        .customerProfile
                        .id
                  },

                  data: {
                    phone:
                      input.phone ||
                      existingUser
                        .customerProfile
                        .phone ||
                      null
                  }
                });
              } else {
                await tx.customerProfile.create({
                  data: {
                    userId:
                      existingUser.id,

                    phone:
                      input.phone ||
                      null
                  }
                });
              }

              return updatedUser;
            }
          );
      } else {
        /*
          Brand-new customer registration.
          Keep your existing auth-service flow.
        */
        user =
          await createCustomer({
            ...input,
            email:
              normalizedEmail
          });
      }

      const token =
        issueToken(
          user
        );

      setAuthCookie(
        res,
        token
      );

      res
        .status(201)
        .json({
          user:
            publicUser(
              user
            )
        });
    }
  )
);

// ============================================================
// CUSTOMER LOGIN
// ============================================================

router.post(
  '/customer/login',

  asyncHandler(
    async (req, res) => {
      const input =
        loginSchema.parse(
          req.body
        );

      const normalizedEmail =
        input.email
          .trim()
          .toLowerCase();

      const storedUser =
        await prisma.user.findUnique({
          where: {
            email:
              normalizedEmail
          }
        });

      /*
        Guest-only records have passwordHash = null.
        They cannot log in until they register.
      */
      if (
        !storedUser ||
        !storedUser.passwordHash
      ) {
        return res
          .status(401)
          .json({
            message:
              'Invalid email or password.'
          });
      }

      const user =
        await authenticate(
          normalizedEmail,
          input.password,
          [
            'CUSTOMER'
          ]
        );

      const token =
        issueToken(
          user
        );

      setAuthCookie(
        res,
        token
      );

      res.json({
        user:
          publicUser(
            user
          )
      });
    }
  )
);

// ============================================================
// ADMIN BOOTSTRAP
// ============================================================

router.post(
  '/admin/bootstrap',

  asyncHandler(
    async (req, res) => {
      const input =
        registerSchema
          .omit({
            phone: true
          })
          .parse(
            req.body
          );

      const user =
        await bootstrapAdmin(
          input
        );

      const token =
        issueToken(
          user
        );

      setAuthCookie(
        res,
        token
      );

      res
        .status(201)
        .json({
          user:
            publicUser(
              user
            )
        });
    }
  )
);

// ============================================================
// ADMIN LOGIN
// ============================================================

router.post(
  '/admin/login',

  asyncHandler(
    async (req, res) => {
      const input =
        loginSchema.parse(
          req.body
        );

      const normalizedEmail =
        input.email
          .trim()
          .toLowerCase();

      const storedUser =
        await prisma.user.findUnique({
          where: {
            email:
              normalizedEmail
          }
        });

      if (
        !storedUser ||
        !storedUser.passwordHash
      ) {
        return res
          .status(401)
          .json({
            message:
              'Invalid email or password.'
          });
      }

      const user =
        await authenticate(
          normalizedEmail,
          input.password,
          [
            'SUPER_ADMIN',
            'ADMIN',
            'FRONT_DESK',
            'HOUSEKEEPING',
            'MAINTENANCE'
          ]
        );

      const token =
        issueToken(
          user
        );

      setAuthCookie(
        res,
        token
      );

      res.json({
        user:
          publicUser(
            user
          )
      });
    }
  )
);

// ============================================================
// LOGOUT
// ============================================================

router.post(
  '/logout',

  (_req, res) => {
    clearAuthCookie(
      res
    );

    res
      .status(204)
      .end();
  }
);

// ============================================================
// CURRENT USER
// ============================================================

router.get(
  '/me',

  requireAuth,

  asyncHandler(
    async (req, res) => {
      res.json({
        user:
          publicUser(
            req.user
          )
      });
    }
  )
);

// ============================================================
// CREATE STAFF USER
// ============================================================

router.post(
  '/admin/staff',

  requireAuth,

  requireRoles(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  asyncHandler(
    async (req, res) => {
      const schema =
        registerSchema
          .omit({
            phone: true
          })
          .extend({
            role:
              z.enum([
                'ADMIN',
                'FRONT_DESK',
                'HOUSEKEEPING',
                'MAINTENANCE'
              ])
          });

      const input =
        schema.parse(
          req.body
        );

      const normalizedEmail =
        input.email
          .trim()
          .toLowerCase();

      const exists =
        await prisma.user.findUnique({
          where: {
            email:
              normalizedEmail
          }
        });

      if (
        exists
      ) {
        return res
          .status(409)
          .json({
            message:
              'Email already exists.'
          });
      }

      const passwordHash =
        await bcrypt.hash(
          input.password,
          12
        );

      const user =
        await prisma.user.create({
          data: {
            email:
              normalizedEmail,

            passwordHash,

            firstName:
              input.firstName,

            lastName:
              input.lastName,

            role:
              input.role,

            isActive:
              true
          }
        });

      res
        .status(201)
        .json({
          user:
            publicUser(
              user
            )
        });
    }
  )
);

export default router;