import z from "zod";
import { BaseRequestSchema } from "./base";

export const insertBookSchema = new BaseRequestSchema({
  jsonSchema: z.object({
    title: z.string(),
    author: z.string(),
    publisher: z.string(),
    year: z.int(),
    edition: z.int(),
    description: z.string(),
    categoryId: z.string(),
    coverUrl: z.url().optional(),
    totalCopies: z.int(),
  }),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({}),
});

export const insertBookJsonSchema = z.object({
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  year: z.int(),
  edition: z.int(),
  description: z.string(),
  categoryId: z.string(),
  coverUrl: z.url().optional(),
  totalCopies: z.int(),
});

export const updateBookSchema = new BaseRequestSchema({
  jsonSchema: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    publisher: z.string().optional(),
    year: z.int().optional(),
    edition: z.int().optional(),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    coverUrl: z.url().optional(),
    totalCopies: z.int().optional(),
  }),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({}),
});
