import { z } from "zod";
import { BaseRequestSchema } from "./base";

export const registerSchema = new BaseRequestSchema({
  jsonSchema: z.object({
    email: z.email(),
    username: z.string().min(3),
    password: z
      .string()
      .min(8)
      .refine((password) => {
        return (
          /[a-z]/.test(password) &&
          /[A-Z]/.test(password) &&
          /\d/.test(password)
        );
      }, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  }),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({}),
});

export const loginSchema = new BaseRequestSchema({
  jsonSchema: z.object({
    usernameOrEmail: z.string(),
    password: z.string(),
  }),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({}),
});
