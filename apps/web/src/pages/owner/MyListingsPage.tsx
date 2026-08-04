import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Send, Eye, AlertCircle, MessageSquare } from "lucide-react";

import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { ModerationStatusBadge } from "../../components/common/ModerationStatusBadge";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { getMyLibraries, deleteLibrary as deleteLibraryApi } from "../../features/library/services";
import { getMyListings, deleteAccommodation } from "../../features/accommodation/services";
import { fetchApi } from "../../services/api";
import type { Accommodation } from "../../features/accommodation/types";
import type { Library } from "@studenthub/types";

type AccomListingItem = Accommodation & {
  status?: string;
  rejectionReason?: string;
  moderationNotes?: string;
};

type LibraryListingItem = Library & {
  status?: string;
  rejectionReason?: string;
  moderationNotes?: string;
};

export function MyListingsPage() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");

  const isLibraryOwner = user?.ownerType === "library";
  const sidebarLinks = getOwnerSidebar(user?.ownerType);

  const {
    data: accomData,
    isLoading: isAccomLoading,
    isError: isAccomError,
    refetch: refetchAccom,
  } = useQuery({
    queryKey: ["owner-my-listings"],
    queryFn: getMyListings,
    enabled: !isLibraryOwner,
  });

  const {
    data: libraryData,
    isLoading: isLibraryLoading,
    isError: isLibraryError,
    refetch: refetchLibrary,
  } = useQuery({
    queryKey: ["owner-my-libraries"],
    queryFn: getMyLibraries,
    enabled: isLibraryOwner,
  });

  const deleteAccomMutation = useMutation({
    mutationFn: deleteAccommodation,
    onSuccess: () => {
      toast.success("Listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["owner-my-listings"] });
    },
    onError: () => {
      toast.error("Failed to delete listing");
    },
  });

  const deleteLibraryMutation = useMutation({
    mutationFn: deleteLibraryApi,
    onSuccess: () => {
      toast.success("Library listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["owner-my-libraries"] });
    },
    onError: () => {
      toast.error("Failed to delete library listing");
    },
  });

  const submitModerationMutation = useMutation({
    mutationFn: async ({ targetType, targetId }: { targetType: string; targetId: string }) => {
      return fetchApi("/moderation/submit", {
        method: "POST",
        body: JSON.stringify({ targetType, targetId }),
      });
    },
    onSuccess: () => {
      toast.success("Listing submitted for admin moderation review!");
      queryClient.invalidateQueries({ queryKey: ["owner-my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-my-libraries"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to submit listing for review");
    },
  });

  const isLoading = isLibraryOwner ? isLibraryLoading : isAccomLoading;
  const isError = isLibraryOwner ? isLibraryError : isAccomError;
  const refetch = isLibraryOwner ? refetchLibrary : refetchAccom;

  const rawItems = isLibraryOwner ? libraryData?.items || [] : accomData?.items || [];
  const stats = isLibraryOwner ? libraryData?.stats : accomData?.stats;

  const filteredItems = (rawItems as (AccomListingItem | LibraryListingItem)[]).filter((item) => {
    const status = (item.status || "DRAFT").toUpperCase();
    if (activeTab === "all") return true;
    if (activeTab === "published" || activeTab === "APPROVED")
      return status === "APPROVED" || status === "PUBLISHED";
    if (activeTab === "pending_review" || activeTab === "PENDING_REVIEW")
      return status === "PENDING_REVIEW" || status === "UNDER_REVIEW";
    if (activeTab === "draft" || activeTab === "DRAFT") return status === "DRAFT";
    if (activeTab === "rejected" || activeTab === "REJECTED") return status === "REJECTED";
    if (activeTab === "archived" || activeTab === "ARCHIVED") return status === "ARCHIVED";
    return true;
  });

  const pageTitle = isLibraryOwner ? "My Libraries" : "My Properties";
  const pageSubtitle = isLibraryOwner
    ? "Manage your study space listings, review statuses, and seat availability."
    : "Manage your property listings, review statuses, and availability.";
  const addUrl = isLibraryOwner ? "/owner/libraries/new" : "/owner/accommodations/new";

  return (
    <DashboardShell
      title={pageTitle}
      subtitle={pageSubtitle}
      links={sidebarLinks}
      currentPath={pathname}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="flex flex-wrap h-auto p-1 bg-muted">
            <TabsTrigger value="all">All ({stats?.total || 0})</TabsTrigger>
            <TabsTrigger value="published">Approved ({stats?.published || 0})</TabsTrigger>
            <TabsTrigger value="pending_review">
              Pending Review ({stats?.pendingReview || 0})
            </TabsTrigger>
            <TabsTrigger value="draft">Drafts ({stats?.draft || 0})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats?.rejected || 0})</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button asChild className="shrink-0 gap-1.5">
          <Link to={addUrl}>
            <Plus className="h-4 w-4" /> {isLibraryOwner ? "Add new library" : "Add new property"}
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={isLibraryOwner ? "No library listings found" : "No property listings found"}
            description={
              activeTab === "all"
                ? isLibraryOwner
                  ? "You haven't created any study library listings yet."
                  : "You haven't created any property listings yet."
                : `No listings found matching tab filter "${activeTab}".`
            }
            action={
              <Button asChild>
                <Link to={addUrl}>
                  {isLibraryOwner ? "Create Library Listing" : "Create Property Listing"}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((rawItem) => {
              const status = rawItem.status || "DRAFT";
              const normStatus = status.toUpperCase();
              const isLib = isLibraryOwner || "seatCapacity" in rawItem;
              const libItem = rawItem as LibraryListingItem;
              const accomItem = rawItem as AccomListingItem;

              const title = isLib ? libItem.name : accomItem.title;
              const image =
                rawItem.images && rawItem.images.length > 0
                  ? rawItem.images[0]
                  : "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80";

              const area = isLib ? libItem.area : accomItem.location?.area;
              const city = isLib
                ? libItem.location?.city || "indore"
                : accomItem.location?.city || "indore";
              const price = isLib ? libItem.pricing?.monthlyFee : accomItem.monthlyRent;
              const viewUrl = isLib ? `/libraries/${rawItem.id}` : `/accommodations/${rawItem.id}`;
              const editUrl = isLib
                ? `/owner/libraries/${rawItem.id}/edit`
                : `/owner/accommodations/${rawItem.id}/edit`;

              const targetType = isLib ? "LIBRARY" : "ACCOMMODATION";

              return (
                <div
                  key={rawItem.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition md:flex-row md:items-start md:justify-between shadow-sm"
                >
                  <div className="flex flex-1 items-start gap-4 min-w-0">
                    <img
                      src={image}
                      alt={title}
                      className="h-20 w-28 shrink-0 rounded-lg object-cover bg-muted border border-border"
                    />
                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-foreground truncate">{title}</h3>
                        <ModerationStatusBadge status={status} />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {area}, {city} ·{" "}
                        {isLib
                          ? `${libItem.availableSeats || 0}/${libItem.seatCapacity || 0} seats available`
                          : accomItem.propertyType}{" "}
                        · ₹{(price || 0).toLocaleString("en-IN")}/mo
                      </p>

                      {/* Admin Rejection Notes Banner */}
                      {normStatus === "REJECTED" &&
                        (rawItem.rejectionReason || rawItem.moderationNotes) && (
                          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs space-y-1 mt-2">
                            <p className="font-bold text-rose-800 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Rejection Reason:{" "}
                              {rawItem.rejectionReason || "Revisions required"}
                            </p>
                            {rawItem.moderationNotes && (
                              <p className="text-rose-700 text-[11px] flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 shrink-0" /> Moderator Notes: "
                                {rawItem.moderationNotes}"
                              </p>
                            )}
                            <p className="text-[10px] text-rose-600 font-medium pt-0.5">
                              Click "Edit" to update your listing details and click "Submit for
                              Review" below.
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 md:border-t-0 md:pt-0 shrink-0">
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                      <Link to={viewUrl}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Link>
                    </Button>

                    {(normStatus === "DRAFT" ||
                      normStatus === "REJECTED" ||
                      normStatus === "APPROVED" ||
                      normStatus === "PUBLISHED" ||
                      normStatus === "PENDING_REVIEW") && (
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                        <Link to={editUrl}>
                          <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Link>
                      </Button>
                    )}

                    {(normStatus === "DRAFT" || normStatus === "REJECTED") && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={submitModerationMutation.isPending}
                        onClick={() =>
                          submitModerationMutation.mutate({ targetType, targetId: rawItem.id })
                        }
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" />{" "}
                        {normStatus === "REJECTED" ? "Resubmit for Review" : "Submit for Review"}
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              isLib
                                ? deleteLibraryMutation.mutate(rawItem.id)
                                : deleteAccomMutation.mutate(rawItem.id)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
