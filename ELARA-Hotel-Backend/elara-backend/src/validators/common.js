import { z } from 'zod';

// Normalize valid email addresses so account lookups use a consistent key.
export const emailSchema = z.string().email().max(254).transform((v) => v.trim().toLowerCase());

// Enforce the password requirements shared by account registration forms.
export const passwordSchema = z.string().min(8).max(128)
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

// Require date-only API inputs in the format consumed by reservation workflows.
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format.');
