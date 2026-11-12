import { z } from 'zod';

export const staffInviteSchema = z.object({
  email: z.string().trim().pipe(z.email('Enter the Gmail address they sign in with')),
  role: z.enum(['owner', 'admin']),
});

export type StaffInviteValues = z.infer<typeof staffInviteSchema>;
