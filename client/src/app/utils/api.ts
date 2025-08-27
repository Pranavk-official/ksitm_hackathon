import { getAccessToken } from "./tokenStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<unknown> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      //   credentials: "include", // Include cookies for refresh token
      ...options,
    };

    // Add auth token if available
    const token = getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    // If unauthorized and not already trying refresh, return the error
    // The refresh will be handled by the auth context
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async get(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<unknown> {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<unknown> {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);
