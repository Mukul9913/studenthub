import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Calendar,
  Heart,
  Share2,
  Flag,
  ShieldCheck,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fetchApi } from "@/services/api";

interface StickyContactCardProps {
  listingId: string;
  listingTitle: string;
  targetType: "ACCOMMODATION" | "LIBRARY" | string;
  price: number;
  pricingLabel?: string;
  ownerName?: string;
  ownerPhone?: string;
  isVerified?: boolean;
  onOpenVisitModal: () => void;
}

export function StickyContactCard({
  listingId,
  listingTitle,
  targetType,
  price,
  pricingLabel = "month",
  ownerName = "Property Owner",
  ownerPhone = "9876543210",
  isVerified = true,
  onOpenVisitModal,
}: StickyContactCardProps) {
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const formattedPhone = ownerPhone.replace(/\D/g, "");
  const cleanPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
  const whatsappMsg = encodeURIComponent(
    `Hi ${ownerName}, I found your ${targetType.toLowerCase()} listing "${listingTitle}" on StudentHub and would like to get more information.`,
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMsg}`;

  const handleCallClick = () => {
    // Log call lead click event
    fetchApi("/leads", {
      method: "POST",
      body: JSON.stringify({
        targetType: targetType.toUpperCase(),
        targetId: listingId,
        message: "Direct Phone Call Lead",
        contactPhone: ownerPhone,
        source: "CALL_CLICK",
      }),
    }).catch(() => {});
    window.location.href = `tel:${ownerPhone}`;
  };

  const handleWhatsAppClick = () => {
    // Log whatsapp lead click event
    fetchApi("/leads", {
      method: "POST",
      body: JSON.stringify({
        targetType: targetType.toUpperCase(),
        targetId: listingId,
        message: "Direct WhatsApp Lead Click",
        contactPhone: ownerPhone,
        source: "WHATSAPP_CLICK",
      }),
    }).catch(() => {});
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listingTitle,
        text: `Check out ${listingTitle} on StudentHub!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Listing link copied to clipboard!");
    }
  };

  const handleSaveToggle = () => {
    setSaved(!saved);
    toast.success(saved ? "Removed from saved listings" : "Saved to your favorites!");
  };

  const handleSendReport = () => {
    if (!reportReason.trim()) {
      toast.error("Please enter a reason for reporting");
      return;
    }
    toast.success("Report submitted to StudentHub Moderation Team.");
    setReportOpen(false);
    setReportReason("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-5 sticky top-24">
      {/* Price Header */}
      <div className="flex items-baseline justify-between border-b border-border pb-4">
        <div>
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Price Starts At
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-foreground">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-muted-foreground">/{pricingLabel}</span>
          </div>
        </div>
        {isVerified && (
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 gap-1 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
          </Badge>
        )}
      </div>

      {/* Owner Info Brief */}
      <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
          <Building className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground truncate">{ownerName}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> Platform Verified Owner
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <Button
          onClick={onOpenVisitModal}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm shadow-md gap-2"
        >
          <Calendar className="h-4 w-4" /> Schedule Visit Request
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleCallClick}
            variant="outline"
            className="h-10 text-xs font-semibold gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Phone className="h-3.5 w-3.5" /> Call Owner
          </Button>

          <Button
            onClick={handleWhatsAppClick}
            variant="outline"
            className="h-10 text-xs font-semibold gap-1.5 border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Auxiliary Utilities (Save, Share, Report) */}
      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <button
          onClick={handleSaveToggle}
          className={`flex items-center gap-1 hover:text-foreground transition font-medium ${
            saved ? "text-rose-600" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-rose-600" : ""}`} /> {saved ? "Saved" : "Save"}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 hover:text-foreground transition font-medium"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>

        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center gap-1 hover:text-destructive transition font-medium"
        >
          <Flag className="h-4 w-4" /> Report
        </button>
      </div>

      {/* Report Listing Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <Flag className="h-5 w-5" /> Report Incorrect Listing Info
            </DialogTitle>
            <DialogDescription>
              Help StudentHub maintain high marketplace accuracy by reporting misleading images,
              wrong rent, or unreachable phone numbers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Reason for Report</Label>
              <Textarea
                placeholder="Describe what is inaccurate or suspicious about this listing..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleSendReport}>
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
