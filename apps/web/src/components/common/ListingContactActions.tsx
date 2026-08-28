import { useState } from "react";
import { Phone, MessageCircle, Calendar, Heart, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useAuth } from "../../features/auth/hooks/useAuth";

import { fetchApi } from "../../services/api";

interface ListingContactActionsProps {
  targetType: "ACCOMMODATION" | "LIBRARY" | "PG" | "HOSTEL";
  targetId: string;
  title: string;
  area: string;
  ownerPhone?: string;
  ownerName?: string;
  ownerIsVerified?: boolean;
}

export function ListingContactActions({
  targetType,
  targetId,
  title,
  area,
  ownerPhone = "9876543210",
  ownerName = "Property Owner",
  ownerIsVerified = true,
}: ListingContactActionsProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("11:00 AM");
  const [message, setMessage] = useState(
    `Hi, I am interested in visiting ${title} in ${area}. Please share availability.`,
  );
  const [contactPhone, setContactPhone] = useState(user?.phone || "");

  const cleanPhone = ownerPhone.replace(/\D/g, "");

  const handleCall = () => {
    // Record Call Event
    if (user) {
      fetchApi("/leads", {
        method: "POST",
        data: {
          targetType,
          targetId,
          source: "CALL_CLICK",
          message: `Phone call initiated for ${title}`,
        },
      }).catch(() => {});
    }

    window.location.href = `tel:${cleanPhone}`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi ${ownerName}, I found your listing "${title}" on StudentHub and would like to inquire about a visit.`,
    );

    if (user) {
      fetchApi("/leads", {
        method: "POST",
        data: {
          targetType,
          targetId,
          source: "WHATSAPP_CLICK",
          message: `WhatsApp chat initiated for ${title}`,
        },
      }).catch(() => {});
    }

    window.open(`https://wa.me/91${cleanPhone}?text=${text}`, "_blank");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success("Saved to your wishlist!");
    } else {
      toast.info("Removed from wishlist.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title,
          text: `Check out ${title} in ${area} on StudentHub!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleSubmitVisitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to send a visit request.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi("/leads", {
        method: "POST",
        data: {
          targetType,
          targetId,
          preferredDate: preferredDate || undefined,
          preferredTime,
          message,
          contactPhone,
          source: "VISIT_REQUEST",
        },
      });

      toast.success("Visit request submitted successfully! The owner will contact you shortly.");
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send visit request.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">{ownerName}</h4>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            {ownerIsVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" />}{" "}
            Verified Owner
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSave}
            className="h-9 w-9 text-slate-600 hover:text-red-600"
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-red-600 text-red-600" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="h-9 w-9 text-slate-600 hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button
          onClick={handleCall}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
        >
          <Phone className="h-4 w-4" /> Call Owner
        </Button>
        <Button
          onClick={handleWhatsApp}
          className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Button>
      </div>

      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 font-medium"
      >
        <Calendar className="h-4 w-4" /> Request Visit / Schedule Call
      </Button>

      {/* Schedule Visit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Schedule a Visit</DialogTitle>
            <DialogDescription>
              Select your preferred date and time to visit <strong>{title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitVisitRequest} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input
                  id="preferredTime"
                  type="text"
                  placeholder="e.g. 11:00 AM"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Your Phone Number</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="10-digit mobile number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message for Owner</Label>
              <Textarea
                id="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write any specific questions or preferred visit timings..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending Request..." : "Submit Visit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
