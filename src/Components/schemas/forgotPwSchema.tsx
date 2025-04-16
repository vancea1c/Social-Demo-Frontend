import { z } from "zod";

export const forgotPwSchema = z.object({
  step: z.coerce.number(),
  identifier: z.string().optional(),
  code: z.string().optional(),
  newPassword: z.string().optional(),
});

export type ForgotPwFormData = z.infer<typeof forgotPwSchema>;
