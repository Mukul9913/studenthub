import { fetchApi } from "@/services/api";
import type { Enquiry, EnquiryStatus } from "@studenthub/types";
import type { CreateEnquiryInput } from "../types";

export async function createEnquiry(payload: CreateEnquiryInput): Promise<Enquiry> {
  return fetchApi<Enquiry>("/enquiries", {
    data: payload,
  });
}

export async function getMyEnquiries(): Promise<Enquiry[]> {
  return fetchApi<Enquiry[]>("/enquiries/me");
}

export async function getOwnerLeads(filters?: {
  status?: string;
  targetType?: string;
}): Promise<Enquiry[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "ALL") {
    params.append("status", filters.status);
  }
  if (filters?.targetType && filters.targetType !== "ALL") {
    params.append("targetType", filters.targetType);
  }
  const queryString = params.toString();

  return fetchApi<Enquiry[]>(`/enquiries/owner/leads${queryString ? `?${queryString}` : ""}`);
}

export async function updateLeadStatus(enquiryId: string, status: EnquiryStatus): Promise<Enquiry> {
  return fetchApi<Enquiry>(`/enquiries/owner/leads/${enquiryId}/status`, {
    method: "PATCH",
    data: { status },
  });
}
