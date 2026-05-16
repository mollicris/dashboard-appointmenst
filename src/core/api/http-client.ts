import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { env } from "@core/config/env";

/**
 * HTTP client abstraction.
 *
 * Features consume `HttpClient` (the interface), not Axios directly.
 * This enforces Dependency Inversion: the higher-level features depend
 * on an abstraction, not on a concrete library. Swapping Axios for
 * `fetch` later requires changes only inside this folder.
 */
export interface HttpClient {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(url: string, body?: unknown): Promise<T>;
  put<T>(url: string, body?: unknown): Promise<T>;
  patch<T>(url: string, body?: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class AxiosHttpClient implements HttpClient {
  private readonly instance: AxiosInstance;
  private tokenProvider: (() => string | null) | null = null;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });

    this.instance.interceptors.request.use((config) => this.attachAuth(config));
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ code?: string; message?: string; details?: unknown }>) => {
        if (error.response) {
          const data = error.response.data ?? {};
          throw new ApiError(
            error.response.status,
            data.code ?? "unknown_error",
            data.message ?? error.message,
            data.details,
          );
        }
        throw new ApiError(0, "network_error", error.message);
      },
    );
  }

  setTokenProvider(provider: () => string | null): void {
    this.tokenProvider = provider;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    const response = await this.instance.post<T>(url, body);
    return response.data;
  }

  async put<T>(url: string, body?: unknown): Promise<T> {
    const response = await this.instance.put<T>(url, body);
    return response.data;
  }

  async patch<T>(url: string, body?: unknown): Promise<T> {
    const response = await this.instance.patch<T>(url, body);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url);
    return response.data;
  }

  private attachAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = this.tokenProvider?.();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  }
}

export const httpClient: HttpClient & { setTokenProvider(p: () => string | null): void } =
  new AxiosHttpClient(env.VITE_API_BASE_URL);
