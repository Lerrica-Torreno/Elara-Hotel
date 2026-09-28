import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { prisma } from '../config/prisma.js';
import { paymentReference } from '../utils/references.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const input = z.object({
    reservationId: z.string().min(1),
    method: z.enum(['CARD', 'GCASH', 'EWALLET', 'BANK_TRANSFER', 'CASH']),
    amount: z.coerce.number().positive(),
    provider: z.string().trim().max(100).optional(),
    providerRef: z.string().trim().max(200).optional()
  }).parse(req.body);

  const reservation = await prisma.reservation.findUnique({ where: { id: input.reservationId } });
  if (!reservation) throw new HttpError(404, 'Reservation not found.');

  // This records a completed payment only after a real provider confirms payment.
  // Until a gateway is connected, keep status PENDING from the client integration.
  const payment = await prisma.payment.create({
    data: {
      reference: paymentReference(),
      reservationId: reservation.id,
      amount: input.amount,
      method: input.method,
      status: input.providerRef ? 'PAID' : 'PENDING',
      provider: input.provider || null,
      providerRef: input.providerRef || null,
      paidAt: input.providerRef ? new Date() : null
    }
  });
  res.status(201).json({ payment });
}));

export default router;
