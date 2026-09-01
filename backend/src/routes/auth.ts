import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { env, IS_PROD } from "../env";
import {
  GoogleAuthenticationError,
  InvalidTokenError,
} from "../exceptions/auth";
import { validateJsonRequest } from "../middlewares/validation";
import {
    createGooglePreRegistrationTempToken,
  createToken,
  getAuthInfo,
  googleCompleteRegister,
  login,
  logout,
  refreshAccessToken,
  register,
} from "../services/auth";
import { googleCompleteRegistrationSchema, loginSchema, registerSchema } from "../validation-schemas/auth";
import { googleAuth } from "@hono/oauth-providers/google";
import { findByEmail } from "../services/users";

export const authRoute = new Hono()
  .post("/register", ...validateJsonRequest(registerSchema), async (c) => {
    const payload = c.req.valid("json");
    const newUser = await register(payload);

    return c.json({ account: newUser }, 201);
  })
  .post("/login", ...validateJsonRequest(loginSchema), async (c) => {
    const payload = c.req.valid("json");
    const validUser = await login(payload);

    const { accessToken, refreshToken } = await createToken({
      ...validUser,
      userEmail: validUser.email,
      expiresIn: 60 * 60 * 24 * 30, // 30 days for refresh token
    });

    setCookie(c, "refreshToken", refreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return c.json(
      {
        validLogin: {
          username: validUser.username,
          email: validUser.email,
          accessToken,
        },
      },
      200,
    );
  })
  .get(
    "/google",
    googleAuth({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      scope: ["openid", "email"],
      redirect_uri: env.GOOGLE_REDIRECT_URI,
    }),
    async (c) => {
      const googleUser = c.get("user-google");

      if (!googleUser?.id || !googleUser.email) {
        throw new GoogleAuthenticationError();
      }

      const existingUser = await findByEmail({ email: googleUser.email });

      if (existingUser) {
        const { refreshToken } = await createToken({
          userId: existingUser.id,
          username: existingUser.username,
          userEmail: existingUser.email,
          role: existingUser.role,
          expiresIn: 60 * 60 * 24 * 30, // 30 days for refresh token
        });

        setCookie(c, "refreshToken", refreshToken, {
          httpOnly: true,
          secure: IS_PROD,
          sameSite: "Lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });

        return c.redirect(`${env.CLIENT_ORIGIN}/successful-login`);
      }

      const tempToken = await createGooglePreRegistrationTempToken({
        googleId: googleUser.id,
        email: googleUser.email,
      });

      setCookie(c, "tempRegistrationToken", tempToken, {
        httpOnly: true,
        path: "/",
        maxAge: 900, // 15 minutes
      });

      return c.redirect(`${env.CLIENT_ORIGIN}/complete-registration`);
    },
  )
  .post(
    "/google/complete-registration",
    ...validateJsonRequest(googleCompleteRegistrationSchema),
    async (c) => {
      const token = c.req.valid("cookie").tempRegistrationToken;
      const payload = c.req.valid("json");

      const newUser = await googleCompleteRegister({ token, ...payload });

      return c.json({ account: newUser });
    },
  )
  .post("/refresh", async (c) => {
    const refreshToken = getCookie(c, "refreshToken");

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    const newAccessToken = await refreshAccessToken({ refreshToken });

    return c.json({ accessToken: newAccessToken }, 200);
  })
  .post("/logout", async (c) => {
    const refreshToken = getCookie(c, "refreshToken");

    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    await logout({ refreshToken });

    setCookie(c, "refreshToken", "", {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "Lax",
      maxAge: 0,
      path: "/",
    });

    c.status(204);
    return c.body(null);
  })
  .get("/me", async (c) => {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      throw new InvalidTokenError();
    }

    const authInfo = await getAuthInfo({ accessToken });
    return c.json({ authInfo }, 200);
  });
