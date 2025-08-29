import { eq, or } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import postgres from "postgres";
import db from "../db/db";
import { refreshTokens, users, UserType } from "../db/schema";
import { hasher, jwt } from "../utils";
import { UnknownError } from "../exceptions/base";
import {
  EmailAlreadyExistsError,
  CredentialNotFoundError,
  InvalidTokenError,
} from "../exceptions/auth";

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
): Promise<{ userId: string; username: string; email: string }> {
  const user = await db()
    .select()
    .from(users)
    .where(
      or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail)),
    )
    .limit(1);

  if (user.length === 0) {
    throw new CredentialNotFoundError();
  }

  const isPasswordValid = hasher.verify(user[0].passwordHash, password);
  if (!isPasswordValid) {
    throw new CredentialNotFoundError();
  }

  return {
    userId: user[0].id,
    username: user[0].username,
    email: user[0].email,
  };
}

export async function createToken(
  user: Pick<UserType, "id" | "username" | "email">,
  deviceId: string,
  expiresIn: number,
): Promise<{ refreshToken: string; accessToken: string }> {
  const { token: refreshToken } = (
    await db()
      .insert(refreshTokens)
      .values({
        userId: user.id,
        deviceId,
        expiredAt: new Date(Date.now() + expiresIn * 1000),
      })
      .returning()
  )[0];

  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };

  const accessToken = await jwt.sign(payload);

  return { refreshToken, accessToken };
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<string> {
  const user = await db()
    .select({
      userId: users.id,
      username: users.username,
      email: users.email,
    })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(eq(refreshTokens.token, refreshToken))
    .limit(1);

  if (user.length === 0) {
    throw new InvalidTokenError();
  }

  const payload = {
    userId: user[0].userId,
    username: user[0].username,
    email: user[0].email,
  };

  const accessToken = await jwt.sign(payload);

  return accessToken;
}

export async function logout(
  refreshToken: string,
): Promise<void> {
  const result = await db()
    .delete(refreshTokens)
    .where(eq(refreshTokens.token, refreshToken))
    .returning();

  if (result.length === 0) {
    throw new InvalidTokenError();
  }
}
