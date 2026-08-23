import { createMiddleware } from "hono/factory";
import { JWTPayload } from "jose";
import { UnauthorizedError } from "../exceptions/auth";

export const adminMiddleware = createMiddleware<{
  Variables: {
    user: JWTPayload & {
      userId: string;
      username: string;
      email: string;
      role: "user" | "admin";
    };
  };
}>(async (c, next) => {
  if (c.get("user").role != "admin") {
    throw new UnauthorizedError();
  }

  await next();
});
