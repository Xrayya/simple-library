import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth";

export const booksRoute = new Hono().get("/", authMiddleware, (c) => {
  return c.json({ message: "You are in books route" });
});
