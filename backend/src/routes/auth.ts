import { Hono } from "hono";
import { validateJsonRequest } from "../middlewares/validation";
import { registerSchema } from "../validation-schemas/auth";
import { register } from "../services/auth";

export const authRoute = new Hono().post(
  "/register",
  ...validateJsonRequest(registerSchema),
  async (c) => {
    const { username, email, password } = c.req.valid("json");
    const newUser = await register(email, username, password);

    return c.json({ account: newUser }, 201);
  },
);
// .post("/login", ...validateJsonRequest(loginSchema), async (c) => {
//   const { email, password } = c.req.valid("json");
//   const { user, token } = await authService.login(email, password);
//
//   return c.json({ user, token }, 200);
// })
// .get("/logout", verifyAuth, async (c) => {
//   const token = c.req.header().authorization?.split(" ")[1];
//   const isLoggedOut = await authService.logout(token);
//
//   return c.json({ isLoggedOut }, 200);
// });
