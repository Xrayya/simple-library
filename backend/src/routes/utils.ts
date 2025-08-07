import { Hono } from "hono";
import db from "../db/db";
import {
  books,
  borrowLogs,
  categories,
  refreshTokens,
  users,
} from "../db/schema";

export const utilsRoute = new Hono().get("/clear-db", async (c) => {
  await db().delete(borrowLogs);
  await db().delete(refreshTokens);
  await db().delete(users);
  await db().delete(books);
  await db().delete(categories);

  return c.json({ message: "Database cleared successfully" }, 200);
});
