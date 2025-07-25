import { Hono } from "hono";
import { logger } from "hono/logger";

const backend = new Hono().basePath("/api/v1");

backend.use(logger());

backend.get("/", (c) => {
  return c.json({ message: "You are in root" });
});

export default backend;
