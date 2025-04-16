import { z } from "zod";

export interface PasswordChecks {
  length: boolean;
  number: boolean;
  uppercase: boolean;
  lowercase: boolean;
  symbol: boolean;
}

export function validatePassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  };
}

// Ca să știm dacă parola e validă per total:
export function isPasswordValid(pw: string): boolean {
  const checks = validatePassword(pw);
  return (
    checks.length &&
    checks.number &&
    checks.uppercase &&
    checks.lowercase &&
    checks.symbol
  );
}

export const passwordValidationSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do no match.",
    path: ["confirmPassword"],
  });

export type PasswordValidationData = z.infer<typeof passwordValidationSchema>;
