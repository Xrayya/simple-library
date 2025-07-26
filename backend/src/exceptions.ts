import { ContentfulStatusCode } from "hono/utils/http-status";

export class EmailAlreadyExistsError extends Error {
  statusCode: ContentfulStatusCode;

  constructor(email: string) {
    super(`Email "${email}" is already registered.`);
    this.name = "EmailAlreadyExistsError";
    this.statusCode = 409;
  }
}
