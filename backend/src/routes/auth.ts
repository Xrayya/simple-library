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

export const authRoute = new Hono()
  .post("/register", ...validateJsonRequest(registerSchema), async (c) => {
    const { username, email, password } = c.req.valid("json");
    const newUser = await register(email, username, password);

    return c.json({ account: newUser }, 201);
  })
  .post("/login", ...validateJsonRequest(loginSchema), async (c) => {
    const { usernameOrEmail, password } = c.req.valid("json");
    const validUser = await login(usernameOrEmail, password);

    const { accessToken, refreshToken } = await createToken({
      id: validUser.userId,
      ...validUser,
    });

    setCookie(c, "accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/acessToken",
    });

    setCookie(c, "refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/refreshToken",
    });

    return c.json(
      {
        validLogin: {
          username: validUser.username,
          email: validUser.email,
          accessToken,
          refreshToken,
        },
      },
      200,
    );
  })
  .post("/refresh", async (c) => {
    const refreshToken = (getCookie(c, "refreshToken") ||
      (await c.req.json()).refreshToken) as string;

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    setCookie(c, "accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return c.json({ accessToken: newAccessToken }, 200);
  })
  .post("/logout", async (c) => {
    const refreshToken = (getCookie(c, "refreshToken") ||
      (await c.req.json()).refreshToken) as string;

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    const loggedOutUser = await logout(refreshToken);

    setCookie(c, "accessToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 0,
    });

    setCookie(c, "refreshToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 0,
    });

    return c.json({ loggedOutUser }, 200);
  });
