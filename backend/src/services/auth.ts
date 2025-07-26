import db from "../db/db";
import { users } from "../db/schema";
import { hasher } from "../utils";

export async function register(
  email: string,
  username: string,
  password: string,
) {
  try {
    const result = (
      await db()
        .insert(users)
        .values({
          email,
          username,
          passwordHash: hasher.encrypt(password),
        })
        .returning()
    )[0];

    return {
      email: result.email,
      username: result.username,
      timestamp: result.createdAt,
    };
  } catch (error) {
    // TODO: if error is unique constraint violation, throw a specific error
    throw new Error("Failed to register user. Please try again.");
  }
}
