import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  BookOpen,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Filter,
  Image as ImageIcon,
  Maximize2,
  X,
} from "lucide-react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { INDORE_AREAS } from "@/features/accommodation/mock-data/areas";
import {
  getAdminListings,
  updateAdminListingStatus,
  type AdminListingItem,
} from "@/features/admin/services/admin.service";

export function AdminListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const domainParam = searchParams.get("domain") || "all";
  const statusParam = searchParams.get("status") || "all";
  const searchParam = searchParams.get("search") || "";
  const areaParam = searchParams.get("area") || "all";

  const [items, setItems] = useState<AdminListingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected item for detail view or rejection action
  const [selectedListing, setSelectedListing] = useState<AdminListingItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminListings({
        domain: domainParam,
        status: statusParam,
        search: searchParam,
        area: areaParam,
        page,
        limit: 10,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [domainParam, statusParam, searchParam, areaParam, page]);

  const handleStatusUpdate = async (
    item: AdminListingItem,
    newStatus: "published" | "rejected" | "suspended" | "pending_review",
    reason?: string,
  ) => {
    try {
      setActionLoading(true);
      await updateAdminListingStatus(item.domain, item.id, newStatus, reason);
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      setRejectionReason("");
      fetchListings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const setFilter = (key: string, val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === "all" || !val) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
      return next;
    });
    setPage(1);
  };

  return (
    <AdminLayout
      title="Listing Management & Moderation"
      subtitle="Domain-aware control panel for reviewing, approving, rejecting, and monitoring listings in Indore."
    >
      {/* Header Bar Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* Domain Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Domain:</span>
          {[
            { id: "all", label: "All Domains" },
            { id: "accommodation", label: "Accommodations" },
            { id: "library", label: "Libraries" },
            { id: "mess", label: "Messes (Soon)" },
            { id: "service_provider", label: "Services (Soon)" },
          ].map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={domainParam === tab.id ? "default" : "outline"}
              onClick={() => setFilter("domain", tab.id)}
              className="text-xs rounded-xl"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, area, owner..."
              value={searchParam}
              onChange={(e) => setFilter("search", e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusParam}
            onChange={(e) => setFilter("status", e.target.value)}
            aria-label="Filter by Status"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Approved / Published</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>

          {/* Area Filter */}
          <select
            value={areaParam}
            onChange={(e) => setFilter("area", e.target.value)}
            aria-label="Filter by Area"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Indore Localities</option>
            {INDORE_AREAS.map((a) => (
              <option key={a.slug} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="font-semibold text-foreground text-sm">Failed to Load Listings</h3>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button size="sm" onClick={fetchListings}>
            Retry Loading
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-border bg-card p-4 animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
          <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="font-bold text-foreground text-base">No Listings Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No listing matching your selected domain or status filter exists in the database.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSearchParams(new URLSearchParams())}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Listing Name</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          {(item.specs?.images as string[])?.[0] ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedListing(item);
                                setActiveImageIndex(0);
                                setPreviewImage((item.specs.images as string[])[0] || null);
                              }}
                              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border group cursor-pointer"
                              title="Click to view image"
                            >
                              <img
                                src={(item.specs.images as string[])[0]}
                                alt={item.name}
                                className="h-full w-full object-cover transition group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                <Eye className="h-3.5 w-3.5" />
                              </div>
                            </button>
                          ) : (
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-muted/60 text-muted-foreground">
                              {item.domain === "library" ? (
                                <BookOpen className="h-5 w-5 text-amber-500" />
                              ) : (
                                <Building2 className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground">{item.name}</p>
                            <p className="text-[11px] font-normal text-muted-foreground flex items-center gap-1">
                              <ImageIcon className="h-3 w-3 text-muted-foreground/70" />
                              {(item.specs?.images as string[])?.length || 0} photo(s)
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            item.domain === "library"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-blue-500/10 text-blue-600"
                          }
                        >
                          {item.domain === "library" ? "Library" : "Accommodation"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {item.owner.firstName} {item.owner.lastName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{item.owner.email}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">{item.area}</td>

                      <td className="px-4 py-3">
                        <Badge
                          className={
                            item.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : item.status === "rejected"
                                ? "bg-rose-500/10 text-rose-600"
                                : "bg-amber-500/10 text-amber-600"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedListing(item);
                            setDetailModalOpen(true);
                          }}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>

                        {item.status !== "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(item, "published")}
                            disabled={actionLoading}
                            className="h-7 px-2 text-xs gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                        )}

                        {item.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedListing(item);
                              setRejectModalOpen(true);
                            }}
                            disabled={actionLoading}
                            className="h-7 px-2 text-xs gap-1 text-rose-600 border-rose-300 hover:bg-rose-50"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>
              Showing {items.length} of {total} listings
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={items.length < 10 || page * 10 >= total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Listing Detail Drawer / Modal */}
      {detailModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase text-[10px]">
                    {selectedListing.domain}
                  </Badge>
                  <Badge
                    className={
                      selectedListing.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }
                  >
                    {selectedListing.status}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-foreground mt-1">{selectedListing.name}</h2>
                <p className="text-xs text-muted-foreground">{selectedListing.area}, Indore</p>
              </div>

              <Button size="sm" variant="ghost" onClick={() => setDetailModalOpen(false)}>
                ✕
              </Button>
            </div>

            {/* Listing Photos / Gallery */}
            {(() => {
              const images = (selectedListing.specs?.images as string[]) || [];
              const currImgIndex = Math.min(activeImageIndex, Math.max(0, images.length - 1));
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-primary" /> Listing Photos ({images.length}
                      )
                    </p>
                    {images.length > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        Click photo to view full size
                      </span>
                    )}
                  </div>

                  {images.length > 0 ? (
                    <div className="space-y-2">
                      <div
                        className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted group cursor-pointer"
                        onClick={() => setPreviewImage(images[currImgIndex] || images[0] || null)}
                      >
                        <img
                          src={images[currImgIndex] || images[0]}
                          alt={selectedListing.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                          <Maximize2 className="h-4 w-4" /> Click to enlarge full screen
                        </div>
                      </div>

                      {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {images.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                currImgIndex === idx
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-border opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Photo ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-muted/20">
                      <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground/60 mb-1" />
                      No photos uploaded for this listing yet.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Owner Section */}
            <div className="rounded-xl border border-border/80 p-4 bg-muted/20 space-y-1 text-xs">
              <p className="font-semibold text-foreground">Listing Owner Details</p>
              <p className="text-muted-foreground">
                Name: {selectedListing.owner.firstName} {selectedListing.owner.lastName}
              </p>
              <p className="text-muted-foreground">Email: {selectedListing.owner.email}</p>
              {selectedListing.owner.phone && (
                <p className="text-muted-foreground">Phone: {selectedListing.owner.phone}</p>
              )}
            </div>

            {/* Domain-Specific Specs */}
            <div className="space-y-3 text-xs">
              <p className="font-semibold text-foreground">Technical Specifications</p>
              {selectedListing.domain === "library" ? (
                <div className="grid gap-2 sm:grid-cols-2 rounded-xl border border-border p-4 bg-amber-500/5">
                  <div>
                    <span className="font-semibold">Seat Capacity: </span>
                    <span>
                      {(selectedListing.specs.seatCapacity as number) || "N/A"} total /{" "}
                      {(selectedListing.specs.availableSeats as number) || "N/A"} available
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Operating Hours: </span>
                    <span>
                      {(
                        selectedListing.specs.operatingHours as {
                          is24x7?: boolean;
                          openingTime?: string;
                          closingTime?: string;
                        }
                      )?.is24x7
                        ? "24x7 Access"
                        : `${
                            (
                              selectedListing.specs.operatingHours as {
                                openingTime?: string;
                                closingTime?: string;
                              }
                            )?.openingTime || ""
                          } - ${
                            (
                              selectedListing.specs.operatingHours as {
                                openingTime?: string;
                                closingTime?: string;
                              }
                            )?.closingTime || ""
                          }`}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Monthly Pricing: </span>
                    <span>
                      ₹
                      {(
                        selectedListing.specs.pricing as {
                          monthlyFee?: number;
                        }
                      )?.monthlyFee || 0}
                      /mo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 rounded-xl border border-border p-4 bg-blue-500/5">
                  <div>
                    <span className="font-semibold">Property Type: </span>
                    <span className="capitalize">
                      {(selectedListing.specs.propertyType as string) || "PG / Hostel"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Amenities: </span>
                    <span>
                      {((selectedListing.specs.amenities as string[]) || []).join(", ") ||
                        "Standard Amenities"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button size="sm" variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
              {selectedListing.status !== "published" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedListing, "published")}
                  disabled={actionLoading}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Approve Listing
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Reject Listing</h3>
            <p className="text-xs text-muted-foreground">
              Please provide a clear rejection reason for{" "}
              <span className="font-semibold">{selectedListing.name}</span> so the owner can fix
              their submission.
            </p>

            <textarea
              placeholder="e.g. Incomplete pricing details or blurry property photos."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={actionLoading || !rejectionReason.trim()}
                onClick={() => handleStatusUpdate(selectedListing, "rejected", rejectionReason)}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Image Viewer */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-black/90 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white hover:bg-black transition shadow-lg"
              title="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Enlarged listing preview"
              className="max-h-[85vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
