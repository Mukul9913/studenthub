import type { EnquiryStatus, EnquiryTargetType } from "@studenthub/types";

export type { Enquiry, EnquiryStatus, EnquiryTargetType } from "@studenthub/types";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  VISIT_SCHEDULED: "Visit Scheduled",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const ENQUIRY_STATUS_STYLES: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-600 border-blue-200",
  CONTACTED: "bg-amber-500/10 text-amber-600 border-amber-200",
  VISIT_SCHEDULED: "bg-primary/10 text-primary border-primary/20",
  CONVERTED: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

export interface CreateEnquiryInput {
  targetType: EnquiryTargetType;
  targetId: string;
  message: string;
}
