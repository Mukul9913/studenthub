import { fetchApi } from "@/services/api";
import type {
  LeadPipelineDTO,
  FollowUpDTO,
  CRMTaskDTO,
  ActivityLogDTO,
  CRMAnalyticsDTO,
  AdminCRMAnalyticsDTO,
  OwnerListingAnalyticsDTO,
} from "@studenthub/types";

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function getCRMPipeline(): Promise<LeadPipelineDTO[]> {
  return fetchApi<LeadPipelineDTO[]>("/crm/pipeline");
}

export async function updatePipelineStage(
  leadId: string,
  data: {
    stage: string;
    note?: string;
    lostReason?: string;
    expectedConversionDate?: string;
    dealValue?: number;
  },
): Promise<LeadPipelineDTO> {
  return fetchApi<LeadPipelineDTO>(`/crm/pipeline/${leadId}/stage`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function addPipelineNote(leadId: string, text: string): Promise<void> {
  await fetchApi(`/crm/pipeline/${leadId}/note`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// ─── Follow-ups ───────────────────────────────────────────────────────────────

export async function getFollowUps(): Promise<{
  today: FollowUpDTO[];
  tomorrow: FollowUpDTO[];
  overdue: FollowUpDTO[];
  upcoming: FollowUpDTO[];
}> {
  return fetchApi("/crm/followups");
}

export async function createFollowUp(data: {
  leadId: string;
  scheduledAt: string;
  type: string;
  notes?: string;
  reminderAt?: string;
}): Promise<FollowUpDTO> {
  return fetchApi<FollowUpDTO>("/crm/followups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeFollowUp(id: string): Promise<void> {
  await fetchApi(`/crm/followups/${id}/complete`, { method: "PATCH" });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getCRMTasks(): Promise<CRMTaskDTO[]> {
  return fetchApi<CRMTaskDTO[]>("/crm/tasks");
}

export async function createCRMTask(data: {
  leadId?: string;
  type: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  tags?: string[];
}): Promise<CRMTaskDTO> {
  return fetchApi<CRMTaskDTO>("/crm/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(id: string, status: string): Promise<void> {
  await fetchApi(`/crm/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── Activity Timeline ────────────────────────────────────────────────────────

export async function getActivityTimeline(leadId: string): Promise<ActivityLogDTO[]> {
  return fetchApi<ActivityLogDTO[]>(`/crm/activity/${leadId}`);
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getCRMAnalytics(): Promise<CRMAnalyticsDTO> {
  return fetchApi<CRMAnalyticsDTO>("/crm/analytics");
}

export async function getAdminCRMAnalytics(): Promise<AdminCRMAnalyticsDTO> {
  return fetchApi<AdminCRMAnalyticsDTO>("/crm/admin/analytics");
}

export async function getOwnerListingAnalytics(): Promise<OwnerListingAnalyticsDTO> {
  return fetchApi<OwnerListingAnalyticsDTO>("/crm/listing-analytics");
}
