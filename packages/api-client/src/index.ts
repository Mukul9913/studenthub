import type {
  AuthResponse,
  LoginUserDto,
  RegisterUserDto,
  User,
  Property,
  Library,
  Enquiry,
  PaginatedResponse,
} from "@studenthub/types";
import { API_ENDPOINTS } from "@studenthub/constants";

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
}

export class StudentHubApiClient {
  private baseUrl: string;
  private getAccessToken?: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.getAccessToken = config.getAccessToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken ? this.getAccessToken() : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.onUnauthorized) {
      this.onUnauthorized();
    }

    const data = await response.json();

    if (!response.ok || data.success === false) {
      const errorMessage = data.message || data.error?.message || `HTTP Error ${response.status}`;
      throw new Error(errorMessage);
    }

    return data.data !== undefined ? data.data : data;
  }

  // Auth API
  async login(dto: LoginUserDto): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async register(dto: RegisterUserDto): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>(API_ENDPOINTS.AUTH.ME, {
      method: "GET",
    });
  }

  // Accommodations API
  async getAccommodations(
    queryParams?: Record<string, string | number | undefined>,
  ): Promise<PaginatedResponse<Property>["data"]> {
    const query = queryParams
      ? "?" +
        Object.entries(queryParams)
          .filter(([_, v]) => v !== undefined && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return this.request<PaginatedResponse<Property>["data"]>(
      `${API_ENDPOINTS.ACCOMMODATIONS.BASE}${query}`,
    );
  }

  async getAccommodationById(id: string): Promise<Property> {
    return this.request<Property>(API_ENDPOINTS.ACCOMMODATIONS.BY_ID(id));
  }

  // Libraries API
  async getLibraries(
    queryParams?: Record<string, string | number | undefined>,
  ): Promise<PaginatedResponse<Library>["data"]> {
    const query = queryParams
      ? "?" +
        Object.entries(queryParams)
          .filter(([_, v]) => v !== undefined && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return this.request<PaginatedResponse<Library>["data"]>(
      `${API_ENDPOINTS.LIBRARIES.BASE}${query}`,
    );
  }

  async getLibraryById(id: string): Promise<Library> {
    return this.request<Library>(API_ENDPOINTS.LIBRARIES.BY_ID(id));
  }

  // Enquiries API
  async submitEnquiry(dto: {
    targetType: string;
    targetId: string;
    message: string;
  }): Promise<Enquiry> {
    return this.request<Enquiry>(API_ENDPOINTS.ENQUIRIES.BASE, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async getMyEnquiries(): Promise<Enquiry[]> {
    return this.request<Enquiry[]>(API_ENDPOINTS.ENQUIRIES.MY_ENQUIRIES);
  }

  // Health API
  async checkHealth(): Promise<{ success: boolean; database: string }> {
    return this.request<{ success: boolean; database: string }>(API_ENDPOINTS.HEALTH);
  }
}
