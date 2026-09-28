import { z } from 'zod';

export const emailSchema = z.string().email().max(254).transform((v) => v.trim().toLowerCase());
export const passwordSchema = z.string().min(8).max(128)
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format.');
