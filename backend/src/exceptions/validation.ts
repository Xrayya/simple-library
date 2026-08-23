import { BaseError } from "./base";

type Trace = { property: string; code: string; message: string };

export class InvalidRequestError extends BaseError {
  traces: Trace[];

  constructor(reqAspect: string, traces: Trace[]) {
    super("InvalidRequestError", `Invalid request ${reqAspect}`, 400);
    this.traces = traces;
  }
}
