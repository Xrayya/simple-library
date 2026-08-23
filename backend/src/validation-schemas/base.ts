import type { ZodObject, ZodRawShape, core } from "zod";

export class BaseRequestSchema<
  TJson extends ZodRawShape = ZodRawShape,
  TQuery extends ZodRawShape = ZodRawShape,
  THeader extends ZodRawShape = ZodRawShape,
  TParams extends ZodRawShape = ZodRawShape,
  TCookie extends ZodRawShape = ZodRawShape,
  TForm extends ZodRawShape = ZodRawShape,
> {
  json: ZodObject<TJson, core.$strip>;
  query: ZodObject<TQuery, core.$strip>;
  header: ZodObject<THeader, core.$strip>;
  param: ZodObject<TParams, core.$strip>;
  cookie: ZodObject<TCookie, core.$strip>;
  form: ZodObject<TForm, core.$strip>;

  constructor({
    jsonSchema,
    querySchema,
    headerSchema,
    paramSchema,
    cookieSchema,
    formSchema,
  }: {
    jsonSchema: ZodObject<TJson, core.$strip>;
    querySchema: ZodObject<TQuery, core.$strip>;
    headerSchema: ZodObject<THeader, core.$strip>;
    paramSchema: ZodObject<TParams, core.$strip>;
    cookieSchema: ZodObject<TCookie, core.$strip>;
    formSchema: ZodObject<TForm, core.$strip>;
  }) {
    this.json = jsonSchema;
    this.query = querySchema;
    this.header = headerSchema;
    this.param = paramSchema;
    this.cookie = cookieSchema;
    this.form = formSchema;
  }
}

// export type TypedRequest<T extends ExpressRequestSchema> = Request<
//   z.infer<T["params"]>,
//   any,
//   z.infer<T["body"]>,
//   z.infer<T["queryParams"]>
// >;
