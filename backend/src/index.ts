import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { authRoute } from "./routes/auth";
import { booksRoute } from "./routes/books";
import { BaseError } from "./exceptions/base";

const backend = new Hono().basePath("/api/v1");

backend.use(logger());

backend.get("/", (c) => {
  return c.json({ message: "You are in root" });
});

backend.route("/auth", authRoute);
backend.route("/books", booksRoute);

backend.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: { name: err.name, message: err.message } },
      err.status,
    );
  }

  if (err instanceof BaseError) {
    return c.json(
      { error: { name: err.name, message: err.message } },
      err.statusCode,
    );
  }

  return c.json({ message: "Internal Server Error" }, 500);
});

export default backend;
