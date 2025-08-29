import { compareSync, hashSync } from "bcrypt-ts";
import { Context } from "hono";
import { JWTPayload, jwtVerify, SignJWT } from "jose";

export const SECRET = new TextEncoder().encode(process.env.SECRET_KEY!);

export const hasher = {
  encrypt: (data: string): string => {
    return hashSync(data, 14);
  },
  verify: (encryptedPassword: string, inputPassword: string): boolean => {
    return compareSync(inputPassword, encryptedPassword);
  },
};

export const jwt = {
  sign: async (payload: any): Promise<string> => {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      // .setExpirationTime("10m")
      .setExpirationTime("4s") // 4 seconds for testing purposes
      .sign(SECRET);
  },
  verify: async (token: string): Promise<JWTPayload> => {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  },
};

export function detectBrowserClient(c: Context): boolean {
  const userAgent = c.req.header("user-agent") || "";
  const origin = c.req.header("origin");
  const secFetch = c.req.header("sec-fetch-site");

  // Simple detection
  return userAgent.includes("Mozilla") || !!origin || !!secFetch;
}
