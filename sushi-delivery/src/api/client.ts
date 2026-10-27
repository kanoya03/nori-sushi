const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!rawApiUrl) throw new Error("EXPO_PUBLIC_API_URL is not configured");
const API_URL = rawApiUrl.replace(/\/+$/, "");

export type RequestControl = { signal?: AbortSignal; timeoutMs?: number };
type RequestOptions = RequestControl & {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  accessToken?: string;
  body?: unknown;
};

let onUnauthorized: ((token: string) => void) | undefined;
export function setUnauthorizedHandler(handler: (token: string) => void) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly kind: "http" | "network" | "timeout" | "response" = "http",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function errorDetails(
  response: Response,
): Promise<{ message: string; code?: string }> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null && "message" in data) {
      if (typeof data.message === "string") {
        return {
          message: data.message,
          code:
            "code" in data && typeof data.code === "string"
              ? data.code
              : undefined,
        };
      }
      if (
        Array.isArray(data.message) &&
        data.message.every((item) => typeof item === "string")
      ) {
        return { message: data.message.join(", ") };
      }
    }
  } catch {
    /* Proxies can return a non-JSON response. */
  }
  return { message: `API error: ${response.status}` };
}

async function request<T>(
  endpoint: string,
  {
    method = "GET",
    accessToken,
    body,
    signal,
    timeoutMs = 30_000,
  }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  try {
    const response = await fetch(`${API_URL}/${endpoint.replace(/^\/+/, "")}`, {
      method,
      headers,
      signal: controller.signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      if (response.status === 401 && accessToken) onUnauthorized?.(accessToken);
      const details = await errorDetails(response);
      throw new ApiError(details.message, response.status, details.code);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (timedOut)
      throw new ApiError("The request timed out.", 0, undefined, "timeout");
    if (signal?.aborted || error instanceof ApiError) throw error;
    if (error instanceof SyntaxError)
      throw new ApiError("Invalid API response.", 0, undefined, "response");
    throw new ApiError(
      "Unable to connect to the API.",
      0,
      undefined,
      "network",
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export const apiClient = {
  request,
  get<T>(endpoint: string, options?: RequestControl) {
    return request<T>(endpoint, options);
  },
  post<T>(endpoint: string, body?: unknown, options?: RequestControl) {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },
  patch<T>(endpoint: string, body?: unknown, options?: RequestControl) {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },
  getWithAuth<T>(
    endpoint: string,
    accessToken: string,
    options?: RequestControl,
  ) {
    return request<T>(endpoint, { ...options, accessToken });
  },
  postWithAuth<T>(
    endpoint: string,
    accessToken: string,
    body?: unknown,
    options?: RequestControl,
  ) {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      accessToken,
      body,
    });
  },
  patchWithAuth<T>(
    endpoint: string,
    accessToken: string,
    body?: unknown,
    options?: RequestControl,
  ) {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      accessToken,
      body,
    });
  },
  deleteWithAuth<T>(
    endpoint: string,
    accessToken: string,
    options?: RequestControl,
  ) {
    return request<T>(endpoint, { ...options, method: "DELETE", accessToken });
  },
};
