import { appConfig } from "@/config/env";
import type { ApiResponse } from "@studenthub/types";

export class ApiError extends Error {
  public code?: string;
  public status: number;
  public details?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Returns the first field-level error message, or the top-level message. */
  get firstFieldError(): string {
    if (this.details) {
      const firstKey = Object.keys(this.details)[0];
      if (firstKey && this.details[firstKey]?.[0]) {
        return this.details[firstKey][0];
      }
    }
    return this.message;
  }
}

const TOKEN_KEY = "accessToken";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    },
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const token = getToken();
  if (token && config.headers) {
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = `${appConfig.apiUrl}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection.",
      0,
      "NETWORK_ERROR",
    );
  }

  let result: ApiResponse<T>;
  try {
    result = await response.json();
  } catch {
    throw new ApiError(
      "Received an unexpected response from the server.",
      response.status,
      "PARSE_ERROR",
    );
  }

  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || result.message || "An error occurred",
      response.status,
      result.error?.code,
      (result.error as { details?: Record<string, string[]> })?.details,
    );
  }

  return result.data as T;
}
