import { z } from "zod";

const today = new Date();
const min18 = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);

export const birth_date_schema = z
  .object({
    day: z.string(),
    month: z.string(),
    year: z.string(),
    touched: z.boolean().optional(),
    birth_date_error: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const { day, month, year, touched } = val;
    if (!touched) return; // nu valida dacă nu s-a interacționat
    const isEmpty = !day && !month && !year;
    const someEmpty = !day || !month || !year;

    if (isEmpty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your birth date.",
        path: ["birth_date_error"], // câmp virtual
      });
      return;
    }

    if (someEmpty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid date.",
        path: ["birth_date_error"], // câmp virtual
      });
      return;
    }

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    const birth_date = new Date(y, m - 1, d);

    if (birth_date > min18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must be at least 18 years old.",
        path: ["birth_date_error"], // câmp virtual
      });
    }
  });

export type birth_date_fields = z.infer<typeof birth_date_schema>;
