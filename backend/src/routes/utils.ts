import { Hono } from "hono";
import db from "../db/db";
import {
  books,
  borrowLogs,
  categories,
  refreshTokens,
  users,
} from "../db/schema";
import { getCookie, setCookie } from "hono/cookie";

export const utilsRoute = new Hono()
  .get("/clear-db", async (c) => {
    await db().delete(borrowLogs);
    await db().delete(refreshTokens);
    await db().delete(users);
    await db().delete(books);
    await db().delete(categories);

    return c.json({ message: "Database cleared successfully" }, 200);
  })
  .post("/clear-token-cookies", async (c) => {
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

    return c.json({ message: "Token cookie cleaning respons sent" }, 200);
  })
  .post("/get-cookies", async (c) => {
    const accessToken =
      getCookie(c, "accessToken") ||
      c.req.header("Authorization")?.split(" ")[1];

    const refreshToken = getCookie(c, "refreshToken");

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    return c.json(
      {
        accessToken: accessToken || "empty",
        refreshToken: refreshToken || "empty",
      },
      200,
    );
  });
