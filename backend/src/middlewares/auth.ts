import { createMiddleware } from "hono/factory";
import { JWTPayload } from "jose";
import {
  AdminRequiredError,
  AuthenticationRequiredError,
} from "../exceptions/auth";
import { getBearerToken, jwt } from "../utils";

export const authMiddleware = createMiddleware<{
  Variables: {
    user: JWTPayload & {
      userId: string;
      username: string;
      email: string;
      role: string;
    };
  };
}>(async (c, next) => {
  const token = getBearerToken(c.req.header("Authorization"));

  if (!token) {
    throw new AuthenticationRequiredError();
  }

  const { payload } = await jwt.verify(token);

  c.set(
    "user",
    payload as JWTPayload & {
      userId: string;
      username: string;
      email: string;
      role: string;
    },
  );
  await next();
});

export const adminMiddleware = createMiddleware<{
  Variables: {
    user: JWTPayload & {
      userId: string;
      username: string;
      email: string;
      role: string;
    };
  };
}>(async (c, next) => {
  if (c.var.user.role !== "admin") {
    throw new AdminRequiredError();
  }

  await next();
});
