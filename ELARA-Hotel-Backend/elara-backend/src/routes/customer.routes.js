import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();
router.use(requireAuth);

router.get('/me', asyncHandler(async (req, res) => {
  if (req.user.role !== 'CUSTOMER') throw new HttpError(403, 'Customer account required.');
  const profile = await prisma.customerProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: true }
  });
  res.json({
    customer: {
      id: profile.id,
      userId: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: profile.phone,
      address: profile.address,
      notes: profile.notes
    }
  });
}));

router.patch('/me', asyncHandler(async (req, res) => {
  if (req.user.role !== 'CUSTOMER') throw new HttpError(403, 'Customer account required.');
  const input = z.object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    phone: z.string().trim().max(30).nullable().optional(),
    address: z.string().trim().max(500).nullable().optional()
  }).parse(req.body);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: req.user.id },
      data: {
        ...(input.firstName ? { firstName: input.firstName } : {}),
        ...(input.lastName ? { lastName: input.lastName } : {})
      }
    });
    const profile = await tx.customerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.address !== undefined ? { address: input.address } : {})
      }
    });
    return { user, profile };
  });

  res.json({
    customer: {
      id: result.profile.id,
      userId: result.user.id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      phone: result.profile.phone,
      address: result.profile.address
    }
  });
}));

export default router;
