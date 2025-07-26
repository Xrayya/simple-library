import postgres from "postgres";
import db from "../db/db";
import { users } from "../db/schema";
import { hasher } from "../utils";
import { EmailAlreadyExistsError } from "../exceptions";

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
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof postgres.PostgresError) {
        if (
          error.cause.code === "23505" &&
          error.cause.constraint_name?.includes("email")
        ) {
          throw new EmailAlreadyExistsError(email);
        }
      }
    } else {
      throw new Error("An unexpected error occurred during registration.");
    }
  }
}
