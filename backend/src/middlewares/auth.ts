import { createMiddleware } from "hono/factory";
import type { JWTPayload } from "jose";
import { AuthenticationRequiredError } from "../exceptions/auth";
import { jwt } from "../utils";

export const authMiddleware = createMiddleware<{
  Variables: {
    user: JWTPayload & {
      userId: string;
      username: string;
      email: string;
      role: "user" | "admin";
    };
  };
}>(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    throw new AuthenticationRequiredError();
  }

  const payload = await jwt.verify(token);

  c.set(
    "user",
    payload as JWTPayload & {
      userId: string;
      username: string;
      email: string;
      role: "user" | "admin";
    },
  );
  await next();
});

