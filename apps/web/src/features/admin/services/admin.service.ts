import { fetchApi } from "@/services/api";

export interface AdminOverviewData {
  users: {
    total: number;
    students: number;
    professionals: number;
    owners: number;
    admins: number;
  };
  listings: {
    total: number;
    accommodation: number;
    library: number;
    mess: number;
    serviceProvider: number;
  };
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  enquiries: {
    total: number;
  };
  recentRegistrations: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    ownerType?: string;
    createdAt: string;
  }>;
  recentListings: Array<{
    id: string;
    name: string;
    domain: "accommodation" | "library";
    area: string;
    status: string;
    createdAt: string;
    ownerName: string;
  }>;
}

export interface AdminListingItem {
  id: string;
  name: string;
  domain: "accommodation" | "library" | "mess" | "service_provider";
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    ownerType?: string;
  };
  area: string;
  status: "draft" | "pending_review" | "published" | "rejected" | "suspended";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  specs: Record<string, unknown>;
}

export interface AdminListingsResponse {
  items: AdminListingItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  items: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    ownerType?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminOwnersResponse {
  items: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    ownerType: string;
    listingsCount: number;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAdminOverview(): Promise<AdminOverviewData> {
  return fetchApi<AdminOverviewData>("/admin/overview");
}

export async function getAdminListings(filters?: {
  domain?: string;
  status?: string;
  search?: string;
  area?: string;
  page?: number;
  limit?: number;
}): Promise<AdminListingsResponse> {
  const params = new URLSearchParams();
  if (filters?.domain && filters.domain !== "all") params.append("domain", filters.domain);
  if (filters?.status && filters.status !== "all") params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.area && filters.area !== "all") params.append("area", filters.area);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  return fetchApi<AdminListingsResponse>(`/admin/listings${queryString ? `?${queryString}` : ""}`);
}

export async function updateAdminListingStatus(
  domain: string,
  id: string,
  status: "published" | "rejected" | "suspended" | "pending_review",
  rejectionReason?: string,
): Promise<Record<string, unknown>> {
  return fetchApi<Record<string, unknown>>(`/admin/listings/${domain}/${id}/status`, {
    method: "PATCH",
    data: { status, rejectionReason },
  });
}

export async function getAdminUsers(filters?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();
  if (filters?.role && filters.role !== "all") params.append("role", filters.role);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  return fetchApi<AdminUsersResponse>(`/admin/users${queryString ? `?${queryString}` : ""}`);
}

export async function getAdminOwners(filters?: {
  ownerType?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminOwnersResponse> {
  const params = new URLSearchParams();
  if (filters?.ownerType && filters.ownerType !== "all")
    params.append("ownerType", filters.ownerType);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  return fetchApi<AdminOwnersResponse>(`/admin/owners${queryString ? `?${queryString}` : ""}`);
}
