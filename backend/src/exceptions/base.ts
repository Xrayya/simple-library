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
