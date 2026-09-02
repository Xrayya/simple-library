import { afterAll, describe, test, expect, setDefaultTimeout } from "bun:test";
import { refreshTokens, users } from "../src/db/schema";
import { db } from "../src/db/db";

setDefaultTimeout(20000);

const baseUrl = "http://localhost:3000/auth";

const mockUser = {
  username: "testuser",
  email: "testuser@example.com",
  password: "Testpassword01",
};

let accessToken: string | undefined;
let refreshToken: string | undefined;

describe("Auth", () => {
  afterAll(async () => {
    await db.delete(refreshTokens);
    await db.delete(users);
  });

  test("should return 201 on valid registration", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...mockUser,
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(201);
    expect(data.account).toBeObject();
    expect(data.account.username).toBe(mockUser.username);
    expect(data.account.email).toBe(mockUser.email);
    expect(data.account.timestamp).toBeString();
  });

  test("should return 409 on duplicate email", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...mockUser,
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeObject();
    expect(data.error.name).toBe("EmailAlreadyExistsError");
  });

  test("should return 200 on valid login", async () => {
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        usernameOrEmail: mockUser.username,
        password: mockUser.password,
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(200);
    expect(data.validLogin).toBeObject();
    expect(data.validLogin.username).toBe(mockUser.username);
    expect(data.validLogin.email).toBe(mockUser.email);
    expect(data.validLogin.accessToken).toBeString();

    const cookies = response.headers.getSetCookie();
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.includes("refreshToken"),
    );

    expect(refreshTokenCookie).toBeString();

    const match = refreshTokenCookie!.match(/refreshToken=(?<token>[^;]+)/);
    const token = match?.groups?.["token"];

    expect(token).toBeString();

    accessToken = data.validLogin.accessToken;
    refreshToken = token;
  });

  test("access token should be valid within 4s after login", async () => {
    const response = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(200);

    const data: any = await response.json();

    expect(data.authInfo).toBeObject();
    expect(data.authInfo.username).toBe(mockUser.username);
    expect(data.authInfo.email).toBe(mockUser.email);
    expect(data.authInfo.role).toBe("user");
  });

  test("access token should be invalid past 4s after login", async () => {
    await new Promise((resolve) => setTimeout(resolve, 4010));

    const response = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(401);
  });

  test("should perform token refresh correctly", async () => {
    const response = await fetch(`${baseUrl}/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    const data: any = await response.json();

    expect(response.status).toBe(200);
    expect(data.accessToken).toBeString();

    accessToken = data.accessToken;
  });

  test("new access token should be valid within 4s after refresh", async () => {
    const response = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(200);

    const data: any = await response.json();

    expect(data.authInfo).toBeObject();
    expect(data.authInfo.username).toBe(mockUser.username);
    expect(data.authInfo.email).toBe(mockUser.email);
    expect(data.authInfo.role).toBe("user");
  });

  test("new access token should be invalid past 4s after refresh", async () => {
    await new Promise((resolve) => setTimeout(resolve, 4010));

    const response = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(401);
  });

  test("should perform logout correctly", async () => {
    const response = await fetch(`${baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    expect(response.status).toBe(204);

    const cookies = response.headers.getSetCookie();
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.includes("refreshToken"),
    );

    expect(refreshTokenCookie).toBeString();

    const match = refreshTokenCookie!.match(/refreshToken=(?<token>[^;]+)/);
    const token = match?.groups?.["token"];

    expect(token).toBeUndefined();
  });
});
