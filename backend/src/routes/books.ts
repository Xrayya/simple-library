import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth";
import { validateJsonRequest } from "../middlewares/validation";
import {
  deleteBook,
  getBooks,
  insertBook,
  updateBook,
} from "../services/books";
import {
  getBooksSchema,
  insertBookSchema,
  updateBookSchema,
} from "../validation-schemas/books";

export const booksRoute = new Hono()
  .get(
    "/",
    authMiddleware,
    ...validateJsonRequest(getBooksSchema),
    async (c) => {
      const filter = c.req.valid("query");

      const { books, totalCount } = await getBooks(filter);

      return c.json({ books, meta: { totalBookCount: totalCount } }, 200);
    },
  )
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
