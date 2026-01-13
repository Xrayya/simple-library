import { BaseError } from "./base";

export class EmailAlreadyExistsError extends BaseError {
  constructor(email: string) {
    super(
      "EmailAlreadyExistsError",
      `Email '${email}' is already registered.`,
      409,
    );
  }
}

export class UserNotFoundError extends BaseError {
  constructor(usernameOrEmail: string) {
    super(
      "UserNotFoundError",
      `User with username or email '${usernameOrEmail}' not found.`,
      404,
    );
  }
}

export class CredentialNotFoundError extends BaseError {
  constructor() {
    super(
      "CredentialNotFoundError",
      "Account with provided credentials is not found.",
      404,
    );
  }
}

export class InvalidTokenError extends BaseError {
  constructor() {
    super("InvalidTokenError", "The provided token is invalid.", 401);
  }
}

export class AuthenticationRequiredError extends BaseError {
  constructor() {
    super(
      "AuthenticationRequiredError",
      "Authentication credentials were not provided.",
      401,
    );
  }
}
