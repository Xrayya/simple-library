import { eq } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import type { JWTPayload } from "jose";
import postgres from "postgres";
import { db } from "../db/db";
import { refreshTokens, users } from "../db/schema";
import {
  CredentialNotFoundError,
  EmailAlreadyExistsError,
  InvalidTokenError,
} from "../exceptions/auth";
import { UnknownError } from "../exceptions/base";
import { hasher, jwt } from "../utils";
import { tempRegistrationTokenSchema } from "../validation-schemas/auth";

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
    const result = await db
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
      });

    return result[0]!;
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

export async function googleCompleteRegister({
  token,
  username,
  password,
}: {
  token: string;
  username: string;
  password: string;
}): Promise<{
  email: string;
  username: string;
  timestamp: Date;
}> {
  const payload = await jwt.verify(token);
  const parsedPayload = tempRegistrationTokenSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new InvalidTokenError();
  }

  try {
    const result = await db
      .insert(users)
      .values({
        email: parsedPayload.data.email,
        username,
        passwordHash: hasher.encrypt(password),
        googleId: parsedPayload.data.googleId,
      })
      .returning({
        email: users.email,
        username: users.username,
        timestamp: users.createdAt,
      });

    return result[0]!;
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
      throw new EmailAlreadyExistsError(parsedPayload.data.email);
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
}): Promise<{
  userId: string;
  username: string;
  email: string;
  role: "admin" | "user";
}> {
  const user = await db.query.users.findFirst({
    where: {
      OR: [
        { username: { eq: usernameOrEmail } },
        { email: { eq: usernameOrEmail } },
      ],
    },
  });

  if (!user) {
    throw new CredentialNotFoundError();
  }

  const isPasswordValid = hasher.verify(user.passwordHash, password);

  if (!isPasswordValid) {
    throw new CredentialNotFoundError();
  }

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

export async function createToken({
  userId,
  username,
  role,
  userEmail,
  expiresIn,
}: {
  userId: string;
  username: string;
  role: "admin" | "user";
  userEmail: string;
  expiresIn: number;
}): Promise<{ refreshToken: string; accessToken: string }> {
  // WARN: Potential exception
  const result = await db
    .insert(refreshTokens)
    .values({
      ownerId: userId,
      expiredAt: new Date(Date.now() + expiresIn * 1000),
    })
    .returning({
      refreshToken: refreshTokens.token,
    });

  const payload = {
    userId,
    username,
    email: userEmail,
    role,
  };

  const accessToken = await jwt.sign(payload);

  return { refreshToken: result[0]!.refreshToken, accessToken };
}

export async function refreshAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<string> {
  const result = await db.query.refreshTokens.findFirst({
    columns: {},
    where: {
      token: { eq: refreshToken },
    },
    with: {
      owner: {
        columns: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!result) {
    throw new InvalidTokenError();
  }

  const payload = {
    userId: result.owner.id,
    username: result.owner.username,
    email: result.owner.email,
    role: result.owner.role,
  };

  const accessToken = await jwt.sign(payload);

  return accessToken;
}

export async function createGooglePreRegistrationTempToken({
  googleId,
  email,
}: {
  googleId: string;
  email: string;
}): Promise<string> {
  const token = await jwt.sign(
    {
      googleId,
      email,
    },
    {
      expirationTime: "15m",
    },
  );

  return token;
}

export async function logout({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<void> {
  const result = await db
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
}): Promise<{ username: string; email: string; role: "admin" | "user" }> {
  const { userId } = (await jwt.verify(accessToken)) as JWTPayload & {
    userId: string;
    username: string;
    email: string;
    role: "admin" | "user";
  };

  const user = await db.query.users.findFirst({
    columns: {
      username: true,
      email: true,
      role: true,
    },
    where: {
      id: { eq: userId },
    },
  });

  if (!user) {
    throw new InvalidTokenError();
  }

  return {
    username: user.username,
    email: user.email,
    role: user.role,
  };
}
