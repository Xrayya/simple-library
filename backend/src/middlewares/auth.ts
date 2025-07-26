import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { JWTPayload, jwtVerify } from "jose";
import { SECRET } from "../utils";

export const authMiddleware = createMiddleware<{
  Variables: {
    user: JWTPayload & {
      userId: string;
      username: string;
      email: string;
    };
  };
}>(async (c, next) => {
  const token =
    getCookie(c, "accessToken") || c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Token missing" }, 401);
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
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }
});
