const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL;

if (!rawApiUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not configured'
  );
}

const API_URL =
  rawApiUrl.replace(
    /\/+$/,
    ''
  );

type RequestOptions = {
  method?:
    | 'GET'
    | 'POST'
    | 'PATCH'
    | 'DELETE';

  accessToken?: string;
  body?: unknown;
};

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
  }
}

const buildUrl = (
  endpoint: string
): string => {
  const normalizedEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

  return `${API_URL}${normalizedEndpoint}`;
};

const getErrorMessage = async (
  response: Response
): Promise<string> => {
  try {
    const data: unknown =
      await response.json();

    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data
    ) {
      const message =
        (
          data as {
            message?: unknown;
          }
        ).message;

      if (
        typeof message ===
        'string'
      ) {
        return message;
      }

      if (
        Array.isArray(message) &&
        message.every(
          (item) =>
            typeof item ===
            'string'
        )
      ) {
        return message.join(
          ', '
        );
      }
    }
  } catch {
    // Backend did not return JSON.
  }

  return `API error: ${response.status}`;
};

const request = async <T>(
  endpoint: string,
  {
    method = 'GET',
    accessToken,
    body,
  }: RequestOptions = {}
): Promise<T> => {
  const headers: Record<
    string,
    string
  > = {};

  if (body !== undefined) {
    headers['Content-Type'] =
      'application/json';
  }

  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  const response =
    await fetch(
      buildUrl(endpoint),
      {
        method,
        headers,

        body:
          body !== undefined
            ? JSON.stringify(
                body
              )
            : undefined,
      }
    );

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response
      );

    throw new ApiError(
      message,
      response.status
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return (
    await response.json()
  ) as T;
};

export const apiClient = {
  get<T>(
    endpoint: string
  ): Promise<T> {
    return request<T>(
      endpoint
    );
  },

  post<T>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'POST',
        body,
      }
    );
  },

  patch<T>(
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'PATCH',
        body,
      }
    );
  },

  getWithAuth<T>(
    endpoint: string,
    accessToken: string
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        accessToken,
      }
    );
  },

  postWithAuth<T>(
    endpoint: string,
    accessToken: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'POST',
        accessToken,
        body,
      }
    );
  },

  patchWithAuth<T>(
    endpoint: string,
    accessToken: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'PATCH',
        accessToken,
        body,
      }
    );
  },

  deleteWithAuth<T>(
    endpoint: string,
    accessToken: string
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'DELETE',
        accessToken,
      }
    );
  },
};