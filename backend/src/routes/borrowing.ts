import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth";
import {
  addBorrowing,
  cancelBorrowing,
  changeBorrowingBook,
  getBorrowings,
  getUserBorrowing,
} from "../services/borrowing";
import { validateJsonRequest } from "../middlewares/validation";
import {
  addBorrowingSchema,
  cancelBorrowingSchema,
  changeBookSchema,
} from "../validation-schemas/borrowing";
import { adminMiddleware } from "../middlewares/admin";

export const borrowingRoute = new Hono()
  .use(authMiddleware)
  .get("/me", async (c) => {
    const { userId } = c.get("user");

    const borrowingList = await getUserBorrowing({ userId });

    return c.json({ borrowingList }, 200);
  })
  // WARNING: Unfinished
  // TODO: filters
  .get("/", adminMiddleware, async (c) => {
    const borrowings = await getBorrowings();

    return c.json({ borrowings }, 200);
  })
  .post("/", ...validateJsonRequest(addBorrowingSchema), async (c) => {
    const { userId } = c.get("user");

    const { bookId } = c.req.valid("json");

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 7);

    const borrowingInfo = await addBorrowing({ userId, bookId, dueAt });

    return c.json({ borrowingInfo }, 201);
  })
  .put("/change-book", ...validateJsonRequest(changeBookSchema), async (c) => {
    const { userId } = c.get("user");

    const { borrowingId, newBookId } = c.req.valid("json");

    const updatedBorrowing = await changeBorrowingBook({
      borrowingId,
      newBookId,
      userId,
    });

    return c.json({ updatedBorrowing }, 200);
  })
  .delete(
    "/cancel",
    ...validateJsonRequest(cancelBorrowingSchema),
    async (c) => {
      const { userId } = c.get("user");

      const { borrowingId } = c.req.valid("json");

      const canceledBorrowing = await cancelBorrowing({ userId, borrowingId });

      return c.json({ canceledBorrowing }, 200);
    },
  );
