import { Hono } from "hono";
import { validateJsonRequest } from "../middlewares/validation";
import { loginSchema, registerSchema } from "../validation-schemas/auth";
import {
  createToken,
  login,
  logout,
  refreshAccessToken,
  register,
} from "../services/auth";
import { getCookie, setCookie } from "hono/cookie";
import { InvalidTokenError } from "../exceptions/auth";
import { detectBrowserClient } from "../utils";

export const authRoute = new Hono<{ Variables: { isBrowserClient: boolean } }>()
  .use(async (c, next) => {
    c.set("isBrowserClient", detectBrowserClient(c));
    await next();
  })
  .post("/register", ...validateJsonRequest(registerSchema), async (c) => {
    const { username, email, password } = c.req.valid("json");
    const newUser = await register(email, username, password);

    return c.json({ account: newUser }, 201);
  })
  .post("/login", ...validateJsonRequest(loginSchema), async (c) => {
    const { usernameOrEmail, password, deviceId } = c.req.valid("json");
    const validUser = await login(usernameOrEmail, password);

    const { accessToken, refreshToken } = await createToken(
      {
        id: validUser.userId,
        ...validUser,
      },
      deviceId,
      60 * 60 * 24 * 30, // 30 days for refresh token
    );

    if (c.get("isBrowserClient")) {
      setCookie(c, "accessToken", accessToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 2, // 2 hours
        path: "/",
      });

      setCookie(c, "refreshToken", refreshToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return c.json(
      {
        validLogin: {
          username: validUser.username,
          email: validUser.email,
          accessToken: c.get("isBrowserClient") ? undefined : accessToken,
          refreshToken: c.get("isBrowserClient") ? undefined : refreshToken,
        },
      },
      200,
    );
  })
  .post("/refresh", async (c) => {
    const refreshToken = (
      c.get("isBrowserClient")
        ? getCookie(c, "refreshToken")
        : (await c.req.json()).refreshToken
    ) as string;

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    if (c.get("isBrowserClient")) {
      setCookie(c, "accessToken", newAccessToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 2, // 2 hours
        path: "/",
      });
    }

    if (!c.get("isBrowserClient")) {
      return c.json({ accessToken: newAccessToken }, 200);
    }

    c.status(204);
    return c.body(null);
  })
  .post("/logout", async (c) => {
    const refreshToken = (
      c.get("isBrowserClient")
        ? getCookie(c, "refreshToken")
        : (await c.req.json()).refreshToken
    ) as string;

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    await logout(refreshToken);

    if (c.get("isBrowserClient")) {
      setCookie(c, "accessToken", "", {
        httpOnly: true,
        // secure: true,
        sameSite: "Lax",
        maxAge: 0,
        path: "/",
      });

      setCookie(c, "refreshToken", "", {
        httpOnly: true,
        // secure: true,
        sameSite: "Lax",
        maxAge: 0,
        path: "/",
      });
    }

    c.status(204);
    return c.body(null);
  });
