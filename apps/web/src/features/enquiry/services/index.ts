import { fetchApi } from "@/services/api";
import type { Enquiry, EnquiryStatus } from "@studenthub/types";
import type { CreateEnquiryInput } from "../types";

/**
 * Creates a lead via `/leads` (DIRECT_ENQUIRY) so owner + admin CRM
 * dashboards see the enquiry. Legacy `/enquiries` is no longer the write path.
 */
export async function createEnquiry(payload: CreateEnquiryInput): Promise<Enquiry> {
  return fetchApi<Enquiry>("/leads", {
    data: {
      targetType: payload.targetType,
      targetId: payload.targetId,
      message: payload.message,
      source: "DIRECT_ENQUIRY",
    },
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
