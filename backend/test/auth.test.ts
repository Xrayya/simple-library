import { afterAll, describe, test, expect } from "bun:test";
import db from "../src/db/db";
import { users } from "../src/db/schema";

const baseUrl = "http://localhost:8787/api/v1/auth";

describe("Auth", () => {
  afterAll(async () => {
    await db().delete(users);
  });

  test("should return 201 on valid registration", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        email: "testuser@example.com",
        password: "Testpassword01",
      }),
    });

    const data: any = await response.json();

    expect(response.status).toBe(201);
    expect(data.account).toBeObject();
    expect(data.account.username).toBe("testuser");
    expect(data.account.email).toBe("testuser@example.com");
    expect(data.account.timestamp).toBeString();
  });

  test("should return 400 on duplicate email", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        email: "testuser@example.com",
        password: "Testpassword01",
      }),
    });

    expect(response.status).toBe(400);
  });
});
