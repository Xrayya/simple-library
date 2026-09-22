import z from "zod";
import { BaseRequestSchema } from "./base";

export const getBooksSchema = new BaseRequestSchema({
  jsonSchema: z.object({}),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({
    id: z.uuid().optional(),
    title: z.string().min(1).max(500).optional(),
    author: z.string().min(1).max(100).optional(),
    publisher: z.string().min(1).max(100).optional(),
    year: z
      .string()
      .regex(/^[1-9]\d*$/, {
        message: "Must be a string containing only positive integers",
      })
      .refine((val) => parseInt(val) < new Date().getFullYear(), {
        message: "Year cannot be in the future",
      })
      .transform((val) => parseInt(val))
      .optional(),
    edition: z
      .string()
      .regex(/^[1-9]\d*$/, {
        message: "Must be a string containing only positive integers",
      })
      .transform((val) => parseInt(val))
      .optional(),
    description: z.string().max(500).optional(),
    categoryId: z.uuid().optional(),
    totalCopies: z
      .string()
      .regex(/^\d+$/, { message: "Must be a non-negative integer" })
      .transform((val) => parseInt(val))
      .optional(),
    availableCopies: z
      .string()
      .regex(/^\d+$/, { message: "Must be a non-negative integer" })
      .transform((val) => parseInt(val))
      .optional(),
    searchString: z.string().optional(),
    publishedYearFrom: z
      .string()
      .regex(/^[1-9]\d*$/, { message: "Must be a positive integer" })
      .transform((val) => parseInt(val))
      .optional(),
    publishedYearUntil: z
      .string()
      .regex(/^[1-9]\d*$/, { message: "Must be a positive integer" })
      .refine((val) => parseInt(val) <= new Date().getFullYear(), {
        message: "Year cannot be in the future",
      })
      .transform((val) => parseInt(val))
      .optional(),
    pageIndex: z
      .string()
      .regex(/^\d+$/, { message: "Must be a non-negative integer" })
      .transform((val) => parseInt(val))
      .optional(),
    pageSize: z
      .string()
      .regex(/^\d+$/, { message: "Must be a non-negative integer" })
      .transform((val) => parseInt(val))
      .optional(),
    sorting: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        try {
          return JSON.parse(val) as Array<{ id: string; desc: boolean }>;
        } catch {
          return undefined;
        }
      }),
  }),
});

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
