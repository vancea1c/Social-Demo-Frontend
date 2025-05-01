// utils/mask.ts
export function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!domain) return email; // fallback pentru username
    // păstrăm primele 2 și ultimele 1 caractere din local-part
    const visibleStart = local.slice(0, 2);
    const visibleEnd   = local.slice(-1);
    const stars = "*".repeat(Math.max(0, local.length - 3));
    return `${visibleStart}${stars}${visibleEnd}@${domain}`;
  }
  
  