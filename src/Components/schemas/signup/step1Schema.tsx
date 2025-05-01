import { z } from "zod";
import { BirthDateSchema } from "../../sign_up/BirthDate";
export const step1Schema = z.object({
  first_name: z
    .string()
    .min(1, { message: "Please insert your First name." })
    .min(3, {
      message: "Your First name is too short.",
    }),
  last_name: z
    .string()
    .min(1, { message: "Please insert your Last name." })
    .min(3, {
      message: "Your Last name is too short.",
    }),

  email: z
    .string()
    .min(1, { message: "Please insert your Email." })
    .email({ message: "Please provide a valid Email address." })
    .refine(
      async (value) => {
        const res = await fetch(
          `/api/accounts/check-email/?email=${value}`
        );
        const data = await res.json();
        return data.available;
      },
      { message: "This email is already registered." }
    ),

  username: z
    .string()
    .min(1, { message: "Please choose an username." })
    .min(3, { message: "Your Username is too short." })
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message:
        "Usernames can only use letters, numbers, underscores and periods.",
    })
    .refine(
      async (value) => {
        const res = await fetch(
          `/api/accounts/check-username/?username=${value}`
        );
        const data = await res.json();
        return data.available;
      },
      { message: "This username is already taken." }
    ),

  gender: z.enum(["male", "female"], {
    required_error: "Please select your gender.",
    invalid_type_error: "Please select your gender.",
  }),
  birth_date_fields: BirthDateSchema,
});

export type Step1Data = z.infer<typeof step1Schema>;
