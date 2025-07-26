import { compareSync, hashSync } from "bcrypt-ts";
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
      .setExpirationTime("2h")
      .sign(SECRET);
  },
  verify: async (token: string): Promise<JWTPayload> => {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  },
};
