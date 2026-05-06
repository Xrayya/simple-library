import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth";
import { validateJsonRequest } from "../middlewares/validation";
import { insertBookSchema } from "../validation-schemas/books";
import { getAllBooks, insertBook } from "../services/books";

export const booksRoute = new Hono()
  .get("/", authMiddleware, async (c) => {
    const books = await getAllBooks();

    return c.json({ books }, 200);
  })
  .post("/", ...validateJsonRequest(insertBookSchema), async (c) => {
    const payload = c.req.valid("json");

    const newBook = await insertBook(payload);

    return c.json({ newBook }, 201);
  });
