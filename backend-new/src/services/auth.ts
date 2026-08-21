import { eq, or } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { JWTPayload } from "jose";
import postgres from "postgres";
import db from "../db/db";
import { refreshTokens, users } from "../db/schema";
import {
  CredentialNotFoundError,
  EmailAlreadyExistsError,
  InvalidTokenError,
} from "../exceptions/auth";
import { UnknownError } from "../exceptions/base";
import { hasher, jwt } from "../utils";

export async function register({
  email,
  username,
  password,
}: {
  email: string;
  username: string;
  password: string;
}): Promise<{ email: string; username: string; timestamp: Date }> {
  try {
    const result = (
      await db()
        .insert(users)
        .values({
          email,
          username,
          passwordHash: hasher.encrypt(password),
        })
        .returning({
          email: users.email,
          username: users.username,
          timestamp: users.createdAt,
        })
    )[0];

    return result;
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

export async function login({
  usernameOrEmail,
  password,
}: {
  usernameOrEmail: string;
  password: string;
}): Promise<{ userId: string; username: string; email: string; role: string }> {
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
    role: user[0].role,
  };
}

export async function createToken({
  userId,
  username,
  userEmail,
  userRole,
  deviceId,
  expiresIn,
}: {
  userId: string;
  username: string;
  userEmail: string;
  userRole: string;
  deviceId: string;
  expiresIn: number;
}): Promise<{ refreshToken: string; accessToken: string }> {
  const { refreshToken } = (
    await db()
      .insert(refreshTokens)
      .values({
        userId: userId,
        deviceId,
        expiredAt: new Date(Date.now() + expiresIn * 1000),
      })
      .returning({
        refreshToken: refreshTokens.token,
      })
  )[0];

  const payload = {
    userId,
    username,
    email: userEmail,
    role: userRole,
  };

  const accessToken = await jwt.sign(payload);

  return { refreshToken, accessToken };
}

export async function refreshAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<string> {
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

export async function logout({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<void> {
  const result = await db()
    .delete(refreshTokens)
    .where(eq(refreshTokens.token, refreshToken))
    .returning({
      id: refreshTokens.id,
    });

  if (result.length === 0) {
    throw new InvalidTokenError();
  }
}

export async function getAuthInfo({
  accessToken,
}: {
  accessToken: string;
}): Promise<{ username: string; email: string; role: string }> {
  const { userId } = (await jwt.verify(accessToken)) as JWTPayload & {
    userId: string;
    username: string;
    email: string;
    role: string;
  };

  const user = await db()
    .select({
      username: users.username,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    throw new InvalidTokenError();
  }

  return {
    username: user[0].username,
    email: user[0].email,
    role: user[0].role,
  };
}
