import { afterAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { db } from "../src/db/db";
import { refreshTokens, users } from "../src/db/schema";
import { InvalidTokenError } from "../src/exceptions/auth";
import {
  createToken,
  getAuthInfo,
  login,
  logout,
  refreshAccessToken,
  register,
} from "../src/services/auth";
import { hasher } from "../src/utils";

setDefaultTimeout(20000);

let mockUser: (typeof users.$inferInsert)[] = [
  {
    username: "bambang",
    email: "bambang@example.com",
    passwordHash: "mockpassword",
  },
  {
    username: "test2",
    email: "test2@gmail.com",
    passwordHash: "mockpassword231",
  },
];

let mockAccessToken: string;
let mockRefreshToken: string;

describe("Auth Service", () => {
  afterAll(async () => {
    await db.delete(refreshTokens);
    await db.delete(users);
  });

  test("should perform proper registration", async () => {
    const newUser = await register({
      ...mockUser[0]!,
      password: mockUser[0]!.passwordHash,
    });

    expect(newUser.username).toBe(mockUser[0]!.username);
    expect(newUser.email).toBe(mockUser[0]!.email);
    expect(newUser.timestamp).toBeDate();

    const newUserComplete = await db.query.users.findFirst({
      where: {
        email: { eq: mockUser[0]!.email },
      },
    });

    expect(newUserComplete).toBeDefined();
    expect(newUserComplete?.id).toBeString();
    expect(newUserComplete?.username).toBe(mockUser[0]!.username);
    expect(newUserComplete?.email).toBe(mockUser[0]!.email);
    expect(
      hasher.verify(newUserComplete?.passwordHash!, mockUser[0]!.passwordHash),
    ).toBe(true);
    expect(newUserComplete?.createdAt).toBeDate();
    expect(newUserComplete?.updatedAt).toBeNull();

    mockUser[0] = {
      ...newUserComplete!,
      passwordHash: mockUser[0]!.passwordHash,
    };
  });

  test("should perform another proper registration", async () => {
    const newUser = await register({
      ...mockUser[1]!,
      password: mockUser[1]!.passwordHash,
    });

    expect(newUser.username).toBe(mockUser[1]!.username);
    expect(newUser.email).toBe(mockUser[1]!.email);
    expect(newUser.timestamp).toBeDate();

    const newUserComplete = await db.query.users.findFirst({
      where: {
        email: { eq: mockUser[1]!.email },
      },
    });

    expect(newUserComplete).toBeDefined();
    expect(newUserComplete?.id).toBeString();
    expect(newUserComplete?.username).toBe(mockUser[1]!.username);
    expect(newUserComplete?.email).toBe(mockUser[1]!.email);
    expect(
      hasher.verify(newUserComplete?.passwordHash!, mockUser[1]!.passwordHash),
    ).toBe(true);
    expect(newUserComplete?.createdAt).toBeDate();
    expect(newUserComplete?.updatedAt).toBeNull();

    mockUser[1] = {
      ...newUserComplete!,
      passwordHash: mockUser[1]!.passwordHash,
    };
  });

  test("should perform proper login with email", async () => {
    const newUser = await login({
      usernameOrEmail: mockUser[0]!.email,
      password: mockUser[0]!.passwordHash,
    });

    expect(newUser.userId).toBeString();
    expect(newUser.username).toBe(mockUser[0]!.username);
    expect(newUser.email).toBe(mockUser[0]!.email);
  });

  test("should perform proper login with username", async () => {
    const newUser = await login({
      usernameOrEmail: mockUser[0]!.username,
      password: mockUser[0]!.passwordHash,
    });

    expect(newUser.userId).toBeString();
    expect(newUser.username).toBe(mockUser[0]!.username);
    expect(newUser.email).toBe(mockUser[0]!.email);
  });

  test("should perform proper login for another user with email", async () => {
    const newUser = await login({
      usernameOrEmail: mockUser[1]!.email,
      password: mockUser[1]!.passwordHash,
    });

    expect(newUser.userId).toBeString();
    expect(newUser.username).toBe(mockUser[1]!.username);
    expect(newUser.email).toBe(mockUser[1]!.email);
  });

  test("should perform proper login for another user with username", async () => {
    const newUser = await login({
      usernameOrEmail: mockUser[1]!.username,
      password: mockUser[1]!.passwordHash,
    });

    expect(newUser.userId).toBeString();
    expect(newUser.username).toBe(mockUser[1]!.username);
    expect(newUser.email).toBe(mockUser[1]!.email);
  });

  test("should perform proper token creation", async () => {
    const { accessToken, refreshToken } = await createToken({
      userId: mockUser[0]!.id!,
      username: mockUser[0]!.username,
      userEmail: mockUser[0]!.email,
      role: "user",
      expiresIn: 60 * 60 * 24 * 30,
    });

    expect(accessToken).toBeString();
    expect(refreshToken).toBeString();

    mockAccessToken = accessToken;
    mockRefreshToken = refreshToken;
  });

  test("acccess token should be valid withitn 4s and contain valid data", async () => {
    const authInfo = await getAuthInfo({ accessToken: mockAccessToken });

    expect(authInfo).toBeDefined();
    expect(authInfo.username).toBe(mockUser[0]!.username);
    expect(authInfo.email).toBe(mockUser[0]!.email);
  });

  test("acccess token should be invalid after 4s", async () => {
    await new Promise((resolve) => setTimeout(resolve, 4010));

    expect(getAuthInfo({ accessToken: mockAccessToken })).rejects.toThrowError(
      InvalidTokenError,
    );
  });

  test("refresh token should contain valid info", async () => {
    const refreshTokenEntry = await db.query.refreshTokens.findFirst({
      where: {
        token: { eq: mockRefreshToken },
      },
    });

    expect(refreshTokenEntry).toBeDefined();
    expect(refreshTokenEntry?.id).toBeString();
    expect(refreshTokenEntry?.ownerId).toBe(mockUser[0]!.id!);
    expect(refreshTokenEntry?.expiredAt).toBeDate();
  });

  test("should perform proper access token refresh", async () => {
    const newRefreshToken = await refreshAccessToken({
      refreshToken: mockRefreshToken,
    });

    expect(newRefreshToken).toBeString();

    mockAccessToken = newRefreshToken;
  });

  test("acccess token should be valid withitn 4s and contain valid data after refresh", async () => {
    const authInfo = await getAuthInfo({ accessToken: mockAccessToken });

    expect(authInfo).toBeDefined();
    expect(authInfo.username).toBe(mockUser[0]!.username);
    expect(authInfo.email).toBe(mockUser[0]!.email);
  });

  test("acccess token should be invalid after 4s after refresh", async () => {
    await new Promise((resolve) => setTimeout(resolve, 4010));

    expect(getAuthInfo({ accessToken: mockAccessToken })).rejects.toThrowError(
      InvalidTokenError,
    );
  });

  test("should perform proper logout", async () => {
    expect(logout({ refreshToken: mockRefreshToken })).resolves.toBeUndefined();

    const refreshTokenEntry = await db.query.refreshTokens.findFirst({
      where: {
        token: { eq: mockRefreshToken },
      },
    });

    expect(refreshTokenEntry).toBeUndefined();
  });
});
