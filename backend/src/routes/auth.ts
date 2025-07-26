import { Hono } from "hono";
import { validateJsonRequest } from "../middlewares/validation";
import { loginSchema, registerSchema } from "../validation-schemas/auth";
import { login, register } from "../services/auth";
import { setCookie } from "hono/cookie";

export const authRoute = new Hono()
  .post("/register", ...validateJsonRequest(registerSchema), async (c) => {
    const { username, email, password } = c.req.valid("json");
    const newUser = await register(email, username, password);

    return c.json({ account: newUser }, 201);
  })
  .post("/login", ...validateJsonRequest(loginSchema), async (c) => {
    const { usernameOrEmail, password } = c.req.valid("json");
    const validLogin = await login(usernameOrEmail, password);

    setCookie(c, "token", validLogin.token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    return c.json({ validLogin }, 200);
  });
// .get("/logout", verifyAuth, async (c) => {
//   const token = c.req.header().authorization?.split(" ")[1];
//   const isLoggedOut = await authService.logout(token);
//
//   return c.json({ isLoggedOut }, 200);
// });
