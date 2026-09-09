import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth";
import { validateJsonRequest } from "../middlewares/validation";
import {
  deleteBook,
  getBooks,
  getTotalBookCount,
  insertBook,
  updateBook,
} from "../services/books";
import {
  insertBookSchema,
  updateBookSchema,
} from "../validation-schemas/books";

export const booksRoute = new Hono()
  .get("/", authMiddleware, async (c) => {
    const books = await getBooks();
    const totalBookCount = await getTotalBookCount();

    return c.json({ books, meta: { totalBookCount } }, 200);
  })
  .post("/", ...validateJsonRequest(insertBookSchema), async (c) => {
    const payload = c.req.valid("json");

    const newBook = await insertBook(payload);

    return c.json({ newBook }, 201);
  })
  .put("/:bookId", ...validateJsonRequest(updateBookSchema), async (c) => {
    const bookId = c.req.param("bookId");
    const payload = c.req.valid("json");

    const updatedBook = await updateBook({ bookId, updatedBookInfo: payload });

    return c.json({ updatedBook }, 200);
  })
  .delete("/:bookId", async (c) => {
    const bookId = c.req.param("bookId");

    const deletedBook = await deleteBook({ bookId });

    return c.json({ deletedBook }, 200);
  });
