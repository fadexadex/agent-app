import type { ErrorRequestHandler } from "express";

interface RequestError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  body?: unknown;
}

export const DEFAULT_JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || "10mb";
export const REQUEST_TOO_LARGE_MESSAGE =
  "Your request is too large. Shorten it or split it into smaller parts and try again.";
export const INVALID_JSON_MESSAGE = "The request body could not be parsed.";
export const GENERIC_API_ERROR_MESSAGE =
  "Something went wrong while processing your request.";

function getStatus(error: RequestError): number {
  const status = error.statusCode ?? error.status;
  return typeof status === "number" && status >= 400 && status < 600 ? status : 500;
}

function isSyntaxBodyError(error: RequestError): boolean {
  return error instanceof SyntaxError && "body" in error;
}

export function isRequestTooLargeError(error: unknown): error is RequestError {
  return (
    !!error &&
    typeof error === "object" &&
    (((error as RequestError).status === 413 || (error as RequestError).statusCode === 413) ||
      (error as RequestError).type === "entity.too.large")
  );
}

export function getApiErrorMessage(error: unknown): string {
  const requestError = error as RequestError;

  if (isRequestTooLargeError(requestError)) {
    return REQUEST_TOO_LARGE_MESSAGE;
  }

  if (isSyntaxBodyError(requestError)) {
    return INVALID_JSON_MESSAGE;
  }

  const status = getStatus(requestError);
  if (status >= 400 && status < 500 && typeof requestError.message === "string" && requestError.message.trim()) {
    return requestError.message.trim();
  }

  return GENERIC_API_ERROR_MESSAGE;
}

export const apiErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestError = error as RequestError;
  const status = getStatus(requestError);
  const message = getApiErrorMessage(requestError);

  if (isRequestTooLargeError(requestError)) {
    console.warn(`[server] Rejected oversized request for ${req.method} ${req.originalUrl}`);
  } else if (status >= 500) {
    console.error(`[server] Unhandled error for ${req.method} ${req.originalUrl}:`, error);
  }

  if (req.originalUrl.startsWith("/api/")) {
    res.status(status).json({ error: message });
    return;
  }

  res.status(status).send(message);
};
