import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import type { ZodRawShape } from "zod";
import { InvalidRequestError } from "../exceptions/validation";
import { BaseRequestSchema } from "../validation-schemas/base";

const handlersFactory = createFactory();

export const validateRequest = <
  TJson extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  THeader extends ZodRawShape = {},
  TParams extends ZodRawShape = {},
  TCookie extends ZodRawShape = {},
  TForm extends ZodRawShape = {},
>(
  schema: BaseRequestSchema<TJson, TQuery, THeader, TParams, TCookie, TForm>,
) => {
  return handlersFactory.createHandlers(
    validator("header", (value, _) => {
      const result = schema.header?.safeParse(value);
      if (!result.success) {
        throw new InvalidRequestError(
          "header",
          result?.error.issues.map(({ path, message, code }) => {
            return {
              property: path.join("."),
              code,
              message,
            };
          }),
        );
      }

      return result.data;
    }),
    validator("param", (value, _) => {
      const result = schema.param?.safeParse(value);
      if (!result?.success) {
        throw new InvalidRequestError(
          "url parameter",
          result?.error.issues.map(({ path, message, code }) => {
            return {
              property: path.join("."),
              code,
              message,
            };
          }),
        );
      }

      return result?.data;
    }),
    validator("query", (value, _) => {
      // if (!schema.query) return value;

      const result = schema.query?.safeParse(value);
      if (!result?.success) {
        throw new InvalidRequestError(
          "query parameter",
          result?.error.issues.map(({ path, message, code }) => {
            return {
              property: path.join("."),
              code,
              message,
            };
          }),
        );
      }

      return result?.data;
    }),
    validator("cookie", (value, _) => {
      // if (!schema.cookie) return value;

      const result = schema.cookie?.safeParse(value);
      if (!result?.success) {
        throw new InvalidRequestError(
          "cookie",
          result?.error.issues.map(({ path, message, code }) => {
            return {
              property: path.join("."),
              code,
              message,
            };
          }),
        );
      }

      return result?.data;
    }),
  );
};

export const validateJsonRequest = <
  TJson extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  THeader extends ZodRawShape = {},
  TParams extends ZodRawShape = {},
  TCookie extends ZodRawShape = {},
  TForm extends ZodRawShape = {},
>(
  schema: BaseRequestSchema<TJson, TQuery, THeader, TParams, TCookie, TForm>,
) => {
  const base = validateRequest(schema);

  return handlersFactory.createHandlers(
    ...base,
    validator("json", (value, _) => {
      const result = schema.json?.safeParse(value);
      if (!result?.success) {
        throw new InvalidRequestError(
          "json payload",
          result?.error.issues.map(({ path, message, code }) => {
            return {
              property: path.join("."),
              code,
              message,
            };
          }),
        );
      }

      return result?.data;
    }),
  );
};

export const validateFormRequest = <
  TJson extends ZodRawShape = {},
  TQuery extends ZodRawShape = {},
  THeader extends ZodRawShape = {},
  TParams extends ZodRawShape = {},
  TCookie extends ZodRawShape = {},
  TForm extends ZodRawShape = {},
>(
  schema: BaseRequestSchema<TJson, TQuery, THeader, TParams, TCookie, TForm>,
) => {
  const base = validateRequest(schema);

  return handlersFactory.createHandlers(
    ...base,
    validator("form", (value, _) => {
      // if (!schema.form) return value;

      const result = schema.form?.safeParse(value);
      if (!result?.success) {
        throw new InvalidRequestError(
          "form payload",
          result?.error.issues.map(({ path, message, code }) => {
            return {
              property: path.join("."),
              code,
              message,
            };
          }),
        );
      }

      return result?.data;
    }),
  );
};
