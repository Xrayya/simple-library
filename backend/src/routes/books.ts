import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth";
import { validateJsonRequest } from "../middlewares/validation";
import {
  insertBookJsonSchema,
  insertBookSchema,
  updateBookSchema,
} from "../validation-schemas/books";
import { getAllBooks, insertBook } from "../services/books";
import { validator } from "hono/validator";
import { InvalidRequestError } from "../exceptions/validation";

export const booksRoute = new Hono()
  .get("/", authMiddleware, async (c) => {
    const books = await getAllBooks();

    return c.json({ books }, 200);
  })
  .post(
    "/",
    validator("json", (value, _) => {
      const result = insertBookJsonSchema.safeParse(value);

      if (!result.success) {
        throw new InvalidRequestError(
          "json payload",
          result?.error.issues.map(({ path, message, code }) => {
            return {
              property: path.join("."),
              code,
              message,
            };
          }),
        );
      }

      return result.data;
    }),
    async (c) => {
      const payload = c.req.valid("json");

      const newBook = await insertBook(payload);

      return c.json({ newBook }, 201);
    },
  )
  .put("/:bookId", ...validateJsonRequest(updateBookSchema), async (c) => {
    const payload = c.req.valid("json");
  })
  .delete("/:bookId", async (c) => { });
