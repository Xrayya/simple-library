import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  DATABASE_TABLE_PREFIX: z.string().default(""),
  JWT_SECRET: z.string().min(8),
  CLIENT_ORIGIN: z.string().default("http://localhost:3001"),
  GOOGLE_CLIENT_ID: z.string().endsWith(".apps.googleusercontent.com"),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
});

export const env = envSchema.parse(Bun.env);

export const IS_PROD = env.NODE_ENV === "production";
