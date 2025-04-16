// helpers/passwordValidation.ts
export interface PasswordChecks {
  length: boolean;
  number: boolean;
  uppercase: boolean;
  lowercase: boolean;
  symbol: boolean;
}

export function validatePassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 7,
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
