import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoute } from "./routes/auth";
import { HTTPException } from "hono/http-exception";
import { EmailAlreadyExistsError } from "./exceptions";

const backend = new Hono().basePath("/api/v1");

backend.use(logger());

backend.get("/", (c) => {
  return c.json({ message: "You are in root" });
});

backend.route("/auth", authRoute);

backend.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: { name: err.name, message: err.message } },
      err.status,
    );
  }

  if (err instanceof EmailAlreadyExistsError) {
    return c.json({ name: err.name, message: err.message }, err.statusCode);
  }

  return c.json({ message: "Internal Server Error" }, 500);
});

export default backend;
