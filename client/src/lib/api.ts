const REQUEST_TOO_LARGE_MESSAGE =
  "Your request is too large. Shorten it or split it into smaller edits and try again.";
const GENERIC_REQUEST_ERROR_MESSAGE = "Request failed. Please try again.";
const GENERIC_SERVER_ERROR_MESSAGE =
  "Something went wrong while processing your request.";

interface ErrorPayload {
  error?: string;
  message?: string;
}

function fallbackMessage(status?: number): string {
  if (status === 413) {
    return REQUEST_TOO_LARGE_MESSAGE;
  }

  if (typeof status === "number" && status >= 500) {
    return GENERIC_SERVER_ERROR_MESSAGE;
  }

  return GENERIC_REQUEST_ERROR_MESSAGE;
}

export function extractApiErrorMessage(raw: string, status?: number): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return fallbackMessage(status);
  }

  try {
    const payload = JSON.parse(trimmed) as ErrorPayload;
    const message =
      typeof payload.error === "string"
        ? payload.error
        : typeof payload.message === "string"
        ? payload.message
        : "";
    if (message.trim()) {
      return extractApiErrorMessage(message, status);
    }
  } catch {
    // Ignore invalid JSON and fall back to text parsing.
  }

  if (/PayloadTooLargeError|request entity too large/i.test(trimmed)) {
    return REQUEST_TOO_LARGE_MESSAGE;
  }

  const withoutTags = trimmed.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (/PayloadTooLargeError|request entity too large/i.test(withoutTags)) {
    return REQUEST_TOO_LARGE_MESSAGE;
  }

  if (/<(?:!DOCTYPE|html|body|head|pre)\b/i.test(trimmed)) {
    return fallbackMessage(status);
  }

  return withoutTags || fallbackMessage(status);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function getResponseErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  return extractApiErrorMessage(text, response.status);
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new ApiError(await getResponseErrorMessage(response), response.status);
  }
  return response;
}

export function toUserFacingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return extractApiErrorMessage(error.message);
  }

  return GENERIC_REQUEST_ERROR_MESSAGE;
}
