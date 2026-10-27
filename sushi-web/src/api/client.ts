const API_URL = (import.meta.env.VITE_API_URL?.trim() || 'https://nori-sushi.onrender.com').replace(
  /\/+$/,
  '',
);

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  accessToken?: string;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
};

let onUnauthorized: ((token: string) => void) | undefined;
export function setUnauthorizedHandler(handler: (token: string) => void) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  readonly status: number;
  readonly kind: 'http' | 'network' | 'timeout' | 'response';
  readonly code?: string;

  constructor(message: string, status = 0, kind: ApiError['kind'] = 'http', code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.code = code;
  }
}

async function getErrorDetails(response: Response): Promise<{ message: string; code?: string }> {
  try {
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'message' in data) {
      if (typeof data.message === 'string') {
        return {
          message: data.message,
          code: 'code' in data && typeof data.code === 'string' ? data.code : undefined,
        };
      }
      if (Array.isArray(data.message) && data.message.every((item) => typeof item === 'string')) {
        return { message: data.message.join(', ') };
      }
    }
  } catch {
    // Render or a proxy can return a non-JSON error response.
  }
  return { message: `API error: ${response.status}` };
}

async function request<T>(
  endpoint: string,
  { method = 'GET', accessToken, body, signal, timeoutMs = 90_000 }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  if (signal?.aborted) {
    controller.abort();
  }
  signal?.addEventListener('abort', abort, { once: true });

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${API_URL}/${endpoint.replace(/^\/+/, '')}`, {
      method,
      headers,
      signal: controller.signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401 && accessToken) {
        onUnauthorized?.(accessToken);
      }
      const details = await getErrorDetails(response);
      throw new ApiError(details.message, response.status, 'http', details.code);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  } catch (error) {
    if (timedOut) {
      throw new ApiError('The request timed out.', 0, 'timeout');
    }
    if (signal?.aborted || error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid API response.', 0, 'response');
    }
    throw new ApiError('Unable to connect to the API.', 0, 'network');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, options);
  },
  request,
};
