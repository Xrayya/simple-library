import { ContentfulStatusCode } from "hono/utils/http-status";

export class BaseError extends Error {
  statusCode: ContentfulStatusCode;

  constructor(name: string, message: string, statusCode: ContentfulStatusCode) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class UnknownError extends BaseError {
  constructor(message: string) {
    super("UnknownError", message, 500);
  }
}

export class EmailAlreadyExistsError extends BaseError {
  constructor(email: string) {
    super(
      "EmailAlreadyExistsError",
      `Email "${email}" is already registered.`,
      409,
    );
  }
}

export class UserNotFoundError extends BaseError {
  constructor(usernameOrEmail: string) {
    super(
      "UserNotFoundError",
      `User with username or email "${usernameOrEmail}" not found.`,
      404,
    );
  }
}

export class InvalidPasswordError extends BaseError {
  constructor() {
    super("InvalidPasswordError", "The provided password is invalid.", 401);
  }
}

export class InvalidTokenError extends BaseError {
  constructor() {
    super("InvalidTokenError", "The provided token is invalid.", 401);
  }
}
