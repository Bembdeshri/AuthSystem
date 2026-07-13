import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),

  lastName: z.string().trim().min(2).max(100),

  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Username can only contain letters, numbers and underscores.",
    }),

  email: z.email(),

  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number.",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});