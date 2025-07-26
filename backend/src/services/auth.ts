import { eq, or } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import postgres from "postgres";
import db from "../db/db";
import { users } from "../db/schema";
import {
  EmailAlreadyExistsError,
  InvalidPasswordError,
  UnknownError,
  UserNotFoundError,
} from "../exceptions";
import { hasher, jwt } from "../utils";

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<{ email: string; username: string; timestamp: Date }> {
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
    if (!(error instanceof DrizzleQueryError)) {
      throw new UnknownError(
        "An unexpected error occurred during registration.",
      );
    }

    if (!(error.cause instanceof postgres.PostgresError)) {
      throw new UnknownError(
        "An unexpected error occurred during registration.",
      );
    }

    if (
      error.cause.code === "23505" &&
      error.cause.constraint_name?.includes("email")
    ) {
      throw new EmailAlreadyExistsError(email);
    } else {
      throw new UnknownError(
        "An unexpected error occurred during registration.",
      );
    }
  }
}

export async function login(
  usernameOrEmail: string,
  password: string,
): Promise<{ user: { username: string; email: string }; token: string }> {
  const user = await db()
    .select()
    .from(users)
    .where(
      or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail)),
    )
    .limit(1);

  if (user.length === 0) {
    throw new UserNotFoundError(usernameOrEmail);
  }

  const isPasswordValid = hasher.verify(user[0].passwordHash, password);
  if (!isPasswordValid) {
    throw new InvalidPasswordError();
  }

  const token = await jwt.sign({
    username: user[0].username,
    email: user[0].email,
    password: user[0].passwordHash,
  });

  return {
    user: {
      username: user[0].username,
      email: user[0].email,
    },
    token,
  };
}
