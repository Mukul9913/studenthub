import { Badge } from "@/components/ui/badge";
import { FileEdit, Clock, Eye, CheckCircle2, XCircle, AlertOctagon, Archive } from "lucide-react";

interface ModerationStatusBadgeProps {
  status: string;
  className?: string;
}

export function ModerationStatusBadge({ status, className = "" }: ModerationStatusBadgeProps) {
  const normStatus = (status || "").toUpperCase();

  switch (normStatus) {
    case "DRAFT":
    case "DRAFT_LISTING":
      return (
        <Badge
          variant="outline"
          className={`bg-slate-100 text-slate-700 border-slate-300 gap-1 text-[10px] uppercase font-semibold ${className}`}
        >
          <FileEdit className="h-3 w-3 text-slate-500" /> Draft
        </Badge>
      );
    case "PENDING_REVIEW":
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-100 text-amber-800 border-amber-300 gap-1 text-[10px] uppercase font-semibold ${className}`}
        >
          <Clock className="h-3 w-3 text-amber-600 animate-pulse" /> Pending Review
        </Badge>
      );
    case "UNDER_REVIEW":
      return (
        <Badge
          variant="outline"
          className={`bg-primary/10 text-primary border-primary/20 gap-1 text-[10px] uppercase font-semibold ${className}`}
        >
          <Eye className="h-3 w-3 text-primary" /> Under Review
        </Badge>
      );
    case "APPROVED":
    case "PUBLISHED":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 text-[10px] uppercase font-semibold ${className}`}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-100 text-rose-800 border-rose-300 gap-1 text-[10px] uppercase font-semibold ${className}`}
        >
          <XCircle className="h-3 w-3 text-rose-600" /> Rejected
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge
          variant="outline"
          className={`bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px] uppercase font-semibold ${className}`}
        >
          <AlertOctagon className="h-3 w-3 text-destructive" /> Suspended
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge
          variant="outline"
          className={`bg-gray-100 text-gray-600 border-gray-300 gap-1 text-[10px] uppercase font-semibold ${className}`}
        >
          <Archive className="h-3 w-3 text-gray-500" /> Archived
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className={`bg-slate-100 text-slate-700 text-[10px] uppercase ${className}`}
        >
          {status}
        </Badge>
      );
  }
}
