import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { InvalidTokenError } from "../exceptions/auth";
import { validateJsonRequest } from "../middlewares/validation";
import {
  createToken,
  getAuthInfo,
  login,
  logout,
  refreshAccessToken,
  register,
} from "../services/auth";
import { detectBrowserClient, getBearerToken } from "../utils";
import { loginSchema, registerSchema } from "../validation-schemas/auth";

export const authRoute = new Hono<{ Variables: { isBrowserClient: boolean } }>()
  .use(async (c, next) => {
    c.set("isBrowserClient", detectBrowserClient(c));
    await next();
  })
  .post("/register", ...validateJsonRequest(registerSchema), async (c) => {
    const payload = c.req.valid("json");
    const newUser = await register(payload);

    return c.json({ account: newUser }, 201);
  })
  .post("/login", ...validateJsonRequest(loginSchema), async (c) => {
    const { usernameOrEmail, password, deviceId } = c.req.valid("json");
    const validUser = await login({ usernameOrEmail, password });

    const { accessToken, refreshToken } = await createToken({
      ...validUser,
      userEmail: validUser.email,
      userRole: validUser.role,
      deviceId,
      expiresIn: 60 * 60 * 24 * 30, // 30 days for refresh token
    });

    if (c.get("isBrowserClient")) {
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
          role: validUser.role,
          accessToken,
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
        : ((await c.req.json().catch(() => ({}))) as { refreshToken?: string })
            .refreshToken
    ) as string;

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    const newAccessToken = await refreshAccessToken({ refreshToken });
    return c.json({ accessToken: newAccessToken }, 200);
  })
  .post("/logout", async (c) => {
    const refreshToken = (
      c.get("isBrowserClient")
        ? getCookie(c, "refreshToken")
        : ((await c.req.json().catch(() => ({}))) as { refreshToken?: string })
            .refreshToken
    ) as string;

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    await logout({ refreshToken });

    if (c.get("isBrowserClient")) {
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
  })
  .get("/me", async (c) => {
    const accessToken = getBearerToken(c.req.header("Authorization"));

    if (!accessToken) {
      throw new InvalidTokenError();
    }

    const authInfo = await getAuthInfo({ accessToken });
    return c.json({ authInfo }, 200);
  });
