import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { JWTPayload, jwtVerify } from "jose";
import { detectBrowserClient, SECRET } from "../utils";
import {
  AuthenticationRequiredError,
  InvalidTokenError,
} from "../exceptions/auth";

export const authMiddleware = createMiddleware<{
  Variables: {
    user: JWTPayload & {
      userId: string;
      username: string;
      email: string;
    };
  };
}>(async (c, next) => {
  const token = detectBrowserClient(c)
    ? getCookie(c, "accessToken")
    : c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    throw new AuthenticationRequiredError();
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    c.set(
      "user",
      payload as JWTPayload & {
        userId: string;
        username: string;
        email: string;
      },
    );
    await next();
  } catch (err) {
    throw new InvalidTokenError();
  }
});
