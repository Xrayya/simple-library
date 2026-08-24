import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { IS_PROD, env } from "./env";
import { BaseError } from "./exceptions/base";
import { InvalidRequestError } from "./exceptions/validation";
import { authRoute } from "./routes/auth";
import { booksRoute } from "./routes/books";
import { utilsRoute } from "./routes/utils";

console.log("Runtime Check:", {
  IS_PROD,
  NODE_ENV: env.NODE_ENV,
  CLIENT_ORIGIN: env.CLIENT_ORIGIN,
});

const backend = new Hono();

backend.use(logger());

backend.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return !IS_PROD ? "*" : null;

      if (env.CLIENT_ORIGIN === origin) {
        return origin;
      }

      return null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

backend.get("/", (c) => {
  return c.json({ message: "You are in root" });
});

backend.route("/auth", authRoute);
backend.route("/books", booksRoute);
backend.route("/utils", utilsRoute);

backend.onError((err, c) => {
  console.log(err);

  if (err instanceof HTTPException) {
    return c.json(
      { error: { name: err.name, message: err.message } },
      err.status,
    );
  }

  if (err instanceof InvalidRequestError) {
    console.log("traces", err.traces);

    return c.json(
      { error: { name: err.name, message: err.message, traces: err.traces } },
      err.statusCode,
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
