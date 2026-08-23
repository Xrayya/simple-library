import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(3),
  password: z
    .string()
    .min(8)
    .refine((password) => {
      return (
        /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)
      );
    }, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
  deviceId: z.string(),
});
