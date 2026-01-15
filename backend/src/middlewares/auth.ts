import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { JWTPayload } from "jose";
import {
  AuthenticationRequiredError
} from "../exceptions/auth";
import { detectBrowserClient, jwt } from "../utils";

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
  const token = detectBrowserClient(c)
    ? getCookie(c, "accessToken")
    : c.req.header("Authorization")?.split(" ")[1];

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
