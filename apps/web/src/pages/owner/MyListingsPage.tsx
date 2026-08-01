import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  XCircle,
  Archive,
} from "lucide-react";

import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  getMyLibraries,
  deleteLibrary as deleteLibraryApi,
  submitLibraryForReview,
} from "../../features/library/services";
import {
  getMyListings,
  deleteAccommodation,
  submitForReview,
} from "../../features/accommodation/services";
import type { Accommodation } from "../../features/accommodation/types";
import type { Library } from "@studenthub/types";

type AccomListingItem = Accommodation & {
  status?: "draft" | "pending_review" | "published" | "rejected" | "archived";
  rejectionReason?: string;
};

type LibraryListingItem = Library & {
  status?: "draft" | "pending_review" | "published" | "rejected" | "archived";
  rejectionReason?: string;
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

  const submitAccomMutation = useMutation({
    mutationFn: submitForReview,
    onSuccess: () => {
      toast.success("Listing submitted for admin review!");
      queryClient.invalidateQueries({ queryKey: ["owner-my-listings"] });
    },
    onError: () => {
      toast.error("Failed to submit listing for review");
    },
  });

  const submitLibraryMutation = useMutation({
    mutationFn: submitLibraryForReview,
    onSuccess: () => {
      toast.success("Library submitted for admin review!");
      queryClient.invalidateQueries({ queryKey: ["owner-my-libraries"] });
    },
    onError: () => {
      toast.error("Failed to submit library for review");
    },
  });

  const isLoading = isLibraryOwner ? isLibraryLoading : isAccomLoading;
  const isError = isLibraryOwner ? isLibraryError : isAccomError;
  const refetch = isLibraryOwner ? refetchLibrary : refetchAccom;

  const rawItems = isLibraryOwner ? libraryData?.items || [] : accomData?.items || [];
  const stats = isLibraryOwner ? libraryData?.stats : accomData?.stats;

  const filteredItems = (rawItems as (AccomListingItem | LibraryListingItem)[]).filter((item) => {
    const status = item.status || "pending_review";
    if (activeTab === "all") return true;
    if (activeTab === "published") return status === "published";
    if (activeTab === "pending_review") return status === "pending_review";
    if (activeTab === "draft") return status === "draft";
    if (activeTab === "rejected") return status === "rejected";
    if (activeTab === "archived") return status === "archived";
    return true;
  });

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Published
          </Badge>
        );
      case "pending_review":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-200 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Draft
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
            <Archive className="h-3 w-3" /> Archived
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-200 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
    }
  };

  const pageTitle = isLibraryOwner ? "My Libraries" : "My Properties";
  const pageSubtitle = isLibraryOwner
    ? "Manage your study space listings, seat capacity, and status."
    : "Manage your property listings, status, and availability.";
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
            <TabsTrigger value="published">Published ({stats?.published || 0})</TabsTrigger>
            <TabsTrigger value="pending_review">Pending ({stats?.pendingReview || 0})</TabsTrigger>
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
                : `No listings found in status "${activeTab}".`
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
              const status = rawItem.status || "pending_review";
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

              return (
                <div
                  key={rawItem.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-1 items-start gap-4">
                    <img
                      src={image}
                      alt={title}
                      className="h-20 w-28 shrink-0 rounded-lg object-cover bg-muted"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{title}</h3>
                        {renderStatusBadge(status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {area}, {city} ·{" "}
                        {isLib
                          ? `${libItem.availableSeats || 0}/${libItem.seatCapacity || 0} seats available`
                          : accomItem.propertyType}{" "}
                        · ₹{(price || 0).toLocaleString("en-IN")}/mo
                      </p>
                      {status === "rejected" && rawItem.rejectionReason && (
                        <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          Rejection note: {rawItem.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 md:border-t-0 md:pt-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={viewUrl}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Link>
                    </Button>

                    {(status === "draft" ||
                      status === "rejected" ||
                      status === "published" ||
                      status === "pending_review") && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={editUrl}>
                          <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Link>
                      </Button>
                    )}

                    {(status === "draft" || status === "rejected") && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={
                          isLib ? submitLibraryMutation.isPending : submitAccomMutation.isPending
                        }
                        onClick={() =>
                          isLib
                            ? submitLibraryMutation.mutate(rawItem.id)
                            : submitAccomMutation.mutate(rawItem.id)
                        }
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" /> Submit
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
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
