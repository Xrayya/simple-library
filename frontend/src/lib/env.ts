import { z } from "zod";

export const envSchema = z.object({
  VITE_BACKEND_ENDPOINT: z.url(),
  VITE_BACKEND_ROUTE_PREFIX: z
    .string()
    .optional()
    .transform((value) => (!value ? "" : value)),
});

export const env = envSchema.parse(import.meta.env);
