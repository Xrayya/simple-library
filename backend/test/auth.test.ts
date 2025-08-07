import { afterAll, describe, test, expect } from "bun:test";
import db from "../src/db/db";
import { refreshTokens, users } from "../src/db/schema";

const baseUrl = "http://localhost:8787/api/v1/auth";

const userData = {
  username: "testuser",
  email: "testuser@example.com",
  password: "Testpassword01",
};

let accessToken: string | undefined;
let refreshToken: string | undefined;

describe("Auth", () => {
  afterAll(async () => {
    await db().delete(refreshTokens);
    await db().delete(users);
  });

  test("should return 201 on valid registration", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(201);
    expect(data.account).toBeObject();
    expect(data.account.username).toBe("testuser");
    expect(data.account.email).toBe("testuser@example.com");
    expect(data.account.timestamp).toBeString();
  });

  test("should return 409 on duplicate email", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
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
      body: JSON.stringify({
        usernameOrEmail: userData.username,
        password: userData.password,
        deviceId: "test-device-id",
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(200);
    expect(data.validLogin).toBeObject();
    expect(data.validLogin.username).toBe("testuser");
    expect(data.validLogin.email).toBe("testuser@example.com");
    expect(data.validLogin.accessToken).toBeString();
    expect(data.validLogin.refreshToken).toBeString();

    accessToken = data.validLogin.accessToken;
    refreshToken = data.validLogin.refreshToken;
  });

  test("access token should be valid within 5s after login", async () => {
    expect(accessToken).toBeDefined();

    // NOTE: set access token expire time to 5 second in util file for this testing
    const response = await fetch(`http://localhost:8787/api/v1/books`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(200);
  });

  test("access token should be invalid 5s after login", async () => {
    expect(accessToken).toBeDefined();

    await new Promise((resolve) => setTimeout(resolve, 4000));

    // NOTE: set access token expire time to 5 second in util file for this testing
    const response = await fetch(`http://localhost:8787/api/v1/books`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(401);
  });

  test("should perform token refresh correctly", async () => {
    expect(refreshToken).toBeDefined();

    const response = await fetch(`${baseUrl}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(200);
    expect(data.accessToken).toBeString();

    accessToken = data.accessToken;

    const response2 = await fetch(`http://localhost:8787/api/v1/books`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response2.status).toBe(200);
  });

  test("should perform logout correctly", async () => {
    expect(refreshToken).toBeDefined();
    expect(accessToken).toBeDefined();

    const response = await fetch(`${baseUrl}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(200);
    expect(data.loggedOutUser.username).toBe(userData.username);
    expect(data.loggedOutUser.email).toBe(userData.email);

    const response2 = await fetch(`${baseUrl}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    expect(response2.status).toBe(401);
  });
});
