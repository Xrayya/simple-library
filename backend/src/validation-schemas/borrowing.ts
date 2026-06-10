import z from "zod";
import { BaseRequestSchema } from "./base";

export const addBorrowingSchema = new BaseRequestSchema({
  jsonSchema: z.object({
    bookId: z.uuid(),
  }),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({}),
});

export const changeBookSchema = new BaseRequestSchema({
  jsonSchema: z.object({
    borrowingId: z.uuid(),
    newBookId: z.uuid(),
  }),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({}),
});

export const cancelBorrowingSchema = new BaseRequestSchema({
  jsonSchema: z.object({
    borrowingId: z.uuid(),
  }),
  cookieSchema: z.object({}),
  formSchema: z.object({}),
  headerSchema: z.object({}),
  paramSchema: z.object({}),
  querySchema: z.object({}),
});
