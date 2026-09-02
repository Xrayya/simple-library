import { compareSync, hashSync } from "bcrypt-ts";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { env, IS_PROD } from "./env";
import { InvalidTokenError } from "./exceptions/auth";

export const SECRET = new TextEncoder().encode(env.JWT_SECRET);

export const hasher = {
  encrypt: (data: string): string => {
    return hashSync(data, 14);
  },
  verify: (encryptedPassword: string, inputPassword: string): boolean => {
    return compareSync(inputPassword, encryptedPassword);
  },
};

export const jwt = {
  sign: async (
    payload: any,
    options?: {
      expirationTime?: number | string | Date;
    },
  ): Promise<string> => {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(
        options?.expirationTime !== undefined
          ? options.expirationTime
          : IS_PROD
            ? "10m"
            : "4s",
      )
      .sign(SECRET);
  },
  verify: async (token: string): Promise<JWTPayload> => {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      return payload;
    } catch (error) {
      throw new InvalidTokenError();
    }
  },
};
