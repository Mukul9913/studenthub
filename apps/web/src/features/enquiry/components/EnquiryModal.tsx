import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import type { EnquiryTargetType } from "@studenthub/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createEnquiry } from "../services";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface EnquiryModalProps {
  targetType: EnquiryTargetType;
  targetId: string;
  targetTitle: string;
  targetArea: string;
  targetImage?: string;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EnquiryModal({
  targetType,
  targetId,
  targetTitle,
  targetArea,
  targetImage,
  triggerText = "Enquire Now",
  triggerVariant = "default",
  triggerClassName,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: EnquiryModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen || setInternalOpen;
  const [message, setMessage] = useState(
    `Hi, I am interested in ${targetTitle} located in ${targetArea}. Please share details regarding availability and pricing.`,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createEnquiry({
        targetType,
        targetId,
        message: message.trim(),
      }),
    onSuccess: () => {
      setIsSuccess(true);
      setErrorMessage(null);
      toast.success("Enquiry sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-enquiries"] });
    },
    onError: (err: Error) => {
      const msg = err.message || "Failed to send enquiry. Please try again.";
      setErrorMessage(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage("Please enter a message.");
      return;
    }
    setErrorMessage(null);
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={triggerClassName}>
          <MessageSquare className="mr-2 h-4 w-4" /> {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Contact Listing Owner
          </DialogTitle>
          <DialogDescription>
            Send a direct enquiry regarding availability, pricing, or to schedule a visit.
          </DialogDescription>
        </DialogHeader>

        {/* Target Summary Card */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          {targetImage && (
            <img
              src={targetImage}
              alt={targetTitle}
              className="h-14 w-14 rounded-lg object-cover border border-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              {targetType}
            </Badge>
            <h4 className="text-sm font-semibold truncate text-foreground">{targetTitle}</h4>
            <p className="text-xs text-muted-foreground">{targetArea}, Indore</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="py-6 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
            <p className="text-sm font-medium">Authentication Required</p>
            <p className="text-xs text-muted-foreground">
              Please log in to your StudentHub account to submit an enquiry.
            </p>
            <Button asChild size="sm" className="mt-2">
              <a href="/login">Log In to Continue</a>
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="text-base font-semibold">Enquiry Sent!</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your request has been delivered to the owner. You can track lead responses in your
              dashboard.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button size="sm" asChild>
                <a href="/dashboard/enquiries">View My Enquiries</a>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground">Your Message</label>
              <Textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="mt-1 text-xs"
                maxLength={1000}
              />
              <span className="text-[10px] text-muted-foreground float-right mt-1">
                {message.length}/1000
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={mutation.isPending} className="gap-2">
                {mutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Send Enquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
