import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Megaphone,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, getOwnerSidebar } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/common/LoadingState";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchApi } from "@/services/api";
import type {
  PlanDTO,
  SubscriptionDTO,
  UsageDTO,
  MarketingServiceDTO,
  LeadPackageDTO,
  VerificationDTO,
} from "@studenthub/types";

export function OwnerSubscriptionPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [docType, setDocType] = useState("Aadhaar Card / GST Register");
  const [docUrl, setDocUrl] = useState("");

  // Fetch Current Subscription & Usage
  const { data: subData, isLoading: loadingSub } = useQuery({
    queryKey: ["owner-subscription"],
    queryFn: () =>
      fetchApi<{ subscription: SubscriptionDTO; usage: UsageDTO; plan: PlanDTO }>(
        "/monetization/subscription/me",
      ),
  });

  // Fetch Available Plans
  const { data: plansData } = useQuery({
    queryKey: ["monetization-plans"],
    queryFn: () => fetchApi<PlanDTO[]>("/monetization/plans"),
  });

  // Fetch Marketing Services
  const { data: servicesData } = useQuery({
    queryKey: ["marketing-services"],
    queryFn: () => fetchApi<MarketingServiceDTO[]>("/monetization/marketing-services"),
  });

  // Fetch Lead Packages
  const { data: leadPackagesData } = useQuery({
    queryKey: ["lead-packages"],
    queryFn: () => fetchApi<LeadPackageDTO[]>("/monetization/lead-packages"),
  });

  // Fetch Verification Status
  const { data: verificationData } = useQuery({
    queryKey: ["verification-status"],
    queryFn: () => fetchApi<VerificationDTO | null>("/monetization/verification/status"),
  });

  // Upgrade Plan Mutation
  const subscribeMutation = useMutation({
    mutationFn: (vars: { planId: string; billingCycle: "MONTHLY" | "ANNUAL" }) =>
      fetchApi<SubscriptionDTO>("/monetization/subscription/subscribe", {
        method: "POST",
        data: vars,
      }),
    onSuccess: () => {
      toast.success("Subscription upgraded successfully!");
      queryClient.invalidateQueries({ queryKey: ["owner-subscription"] });
      setIsUpgrading(false);
      setSelectedPlanId(null);
    },
    onError: () => {
      toast.error("Failed to update subscription plan.");
    },
  });

  // Request Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: (vars: { documentType: string; documentUrls: string[] }) =>
      fetchApi<VerificationDTO>("/monetization/verification/request", {
        method: "POST",
        data: vars,
      }),
    onSuccess: () => {
      toast.success("Verification documents submitted! Verification badge will be updated soon.");
      queryClient.invalidateQueries({ queryKey: ["verification-status"] });
      setVerificationModalOpen(false);
    },
  });

  // Order Marketing Service
  const orderMarketingMutation = useMutation({
    mutationFn: (serviceId: string) =>
      fetchApi("/monetization/marketing-services/order", {
        method: "POST",
        data: { serviceId },
      }),
    onSuccess: () => {
      toast.success("Marketing service requested! Our team will contact you shortly.");
    },
  });

  // Purchase Lead Credits
  const purchaseLeadMutation = useMutation({
    mutationFn: (packageId: string) =>
      fetchApi("/monetization/lead-packages/purchase", {
        method: "POST",
        data: { packageId },
      }),
    onSuccess: () => {
      toast.success("Lead credits added to your account balance!");
      queryClient.invalidateQueries({ queryKey: ["owner-subscription"] });
    },
  });

  if (loadingSub) {
    return (
      <DashboardShell
        title="Subscription & Monetization Hub"
        subtitle="Manage your business plan, usage limits, and featured marketing tools."
        links={getOwnerSidebar(user?.ownerType)}
        currentPath="/owner/subscription"
      >
        <LoadingState />
      </DashboardShell>
    );
  }

  const sub = subData?.subscription;
  const usage = subData?.usage;
  const currentPlan = subData?.plan;
  const plans = plansData || [];
  const services = servicesData || [];
  const leadPackages = leadPackagesData || [];
  const verification = verificationData;

  const maxListings = currentPlan?.features.maxListings || 1;
  const monthlyLeads = currentPlan?.features.monthlyLeadLimit || 25;
  const listingsUsed = usage?.activeListingsCount || 0;
  const leadsReceived = usage?.monthlyLeadsReceived || 0;

  const listingPercentage =
    maxListings === -1 ? 0 : Math.min(100, Math.round((listingsUsed / maxListings) * 100));
  const leadPercentage =
    monthlyLeads === -1 ? 0 : Math.min(100, Math.round((leadsReceived / monthlyLeads) * 100));

  return (
    <DashboardShell
      title="Subscription & Monetization Hub"
      subtitle="Manage your subscription plan, usage quotas, lead credits, and verified status."
      links={getOwnerSidebar(user?.ownerType)}
      currentPath="/owner/subscription"
    >
      {/* Current Subscription Banner */}
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-purple-500/10 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1 gap-1 text-xs">
                <Crown className="h-3.5 w-3.5" /> CURRENT PLAN: {currentPlan?.name || "FREE"}
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 font-semibold text-xs"
              >
                {sub?.status || "ACTIVE"}
              </Badge>
              {verification?.status === "VERIFIED" && (
                <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Owner
                </Badge>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground">
              ₹
              {sub?.billingCycle === "ANNUAL"
                ? currentPlan?.priceAnnual
                : currentPlan?.priceMonthly}{" "}
              <span className="text-xs text-muted-foreground font-normal">
                / {sub?.billingCycle === "ANNUAL" ? "year" : "month"}
              </span>
            </h2>

            <p className="text-xs text-muted-foreground">
              {currentPlan?.description || "Basic owner membership on StudentHub."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {verification?.status !== "VERIFIED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerificationModalOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {verification?.status === "PENDING"
                  ? "Verification Under Review"
                  : "Get Verified Badge"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                const el = document.getElementById("plan-comparison");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-1.5 text-xs font-semibold"
            >
              <Zap className="h-4 w-4" /> Upgrade Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Quota Gauges & Balance Cards */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Listings Quota */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase">
              Active Listings
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {listingsUsed} / {maxListings === -1 ? "∞" : maxListings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Progress
              value={maxListings === -1 ? 100 : listingPercentage}
              className="h-2 bg-muted"
            />
            <p className="text-[11px] text-muted-foreground">
              {maxListings === -1
                ? "Unlimited active listings"
                : `${maxListings - listingsUsed} listings remaining`}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Leads Quota */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase">
              Monthly Student Leads
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {leadsReceived} / {monthlyLeads === -1 ? "∞" : monthlyLeads}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Progress value={monthlyLeads === -1 ? 100 : leadPercentage} className="h-2 bg-muted" />
            <p className="text-[11px] text-muted-foreground">
              {monthlyLeads === -1
                ? "Unlimited lead reception"
                : `${monthlyLeads - leadsReceived} leads available this month`}
            </p>
          </CardContent>
        </Card>

        {/* Lead Credits Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase">
              Pay-Per-Lead Credits
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              {usage?.leadCreditsBalance || 0} Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Credits used when monthly limit is reached.
            </p>
          </CardContent>
        </Card>

        {/* Featured Listings Used */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase font-semibold">
              Promotions Active
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600">
              {usage?.featuredListingsUsed || 0} Promoted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              High visibility homepage & search placements.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Monetization Tabs */}
      <Tabs defaultValue="plans" className="mt-8 space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="plans" id="plan-comparison">
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="marketing">Marketing Services</TabsTrigger>
          <TabsTrigger value="credits">Lead Credits</TabsTrigger>
        </TabsList>

        {/* PLANS TAB */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Choose the Right Growth Plan</h3>
              <p className="text-xs text-muted-foreground">
                Scale your properties, get verified, and maximize direct student bookings.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setBillingCycle("MONTHLY")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  billingCycle === "MONTHLY"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("ANNUAL")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  billingCycle === "ANNUAL"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => {
              const isCurrent = currentPlan?.code === p.code;
              const price = billingCycle === "ANNUAL" ? p.priceAnnual : p.priceMonthly;

              return (
                <Card
                  key={p.id}
                  className={`flex flex-col relative transition ${
                    p.isPopular ? "border-primary shadow-md" : "border-border"
                  }`}
                >
                  {p.isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold text-[10px]">
                      MOST POPULAR
                    </Badge>
                  )}

                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{p.name}</CardTitle>
                    <CardDescription className="text-xs min-h-[36px]">
                      {p.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-foreground">₹{price}</span>
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        / {billingCycle === "ANNUAL" ? "yr" : "mo"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="border-t border-border pt-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          {p.features.maxListings === -1 ? "Unlimited" : p.features.maxListings}{" "}
                          Active Listings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          {p.features.monthlyLeadLimit === -1
                            ? "Unlimited"
                            : p.features.monthlyLeadLimit}{" "}
                          Monthly Leads
                        </span>
                      </div>
                      {p.features.verifiedBadge && (
                        <div className="flex items-center gap-2 font-medium text-emerald-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>Verified Owner Badge</span>
                        </div>
                      )}
                      {p.features.homepageBanner && (
                        <div className="flex items-center gap-2 font-medium text-purple-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>Homepage Banner Placement</span>
                        </div>
                      )}
                      {(p.features.customFeatures || []).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full text-xs font-bold" disabled>
                        Active Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full text-xs font-bold gap-1"
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          setIsUpgrading(true);
                        }}
                      >
                        Select Plan <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* MARKETING SERVICES TAB */}
        <TabsContent value="marketing" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold">One-Time Growth & Marketing Services</h3>
            <p className="text-xs text-muted-foreground">
              Boost your student lead conversions with professional photoshoots, Instagram
              broadcasts, and SEO.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {services.map((s) => (
              <Card key={s.id} className="flex flex-col justify-between">
                <CardHeader>
                  <Badge
                    variant="outline"
                    className="w-fit mb-2 text-[10px] uppercase font-bold border-purple-200 bg-purple-50 text-purple-600"
                  >
                    {s.category}
                  </Badge>
                  <CardTitle className="text-base font-bold">{s.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{s.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold text-foreground">₹{s.price}</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                    {s.deliverables.map((d, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold gap-1.5"
                    onClick={() => orderMarketingMutation.mutate(s.id)}
                    disabled={orderMarketingMutation.isPending}
                  >
                    <Megaphone className="h-4 w-4 text-primary" /> Request Service
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LEAD CREDITS TAB */}
        <TabsContent value="credits" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold">Pay-Per-Lead Credit Packages</h3>
            <p className="text-xs text-muted-foreground">
              Purchase lead credits to ensure continuous inquiry notifications even after reaching
              monthly plan limits.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadPackages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">{pkg.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {pkg.creditsCount} Verified Student Leads
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-foreground">₹{pkg.price}</span>
                    {pkg.discountPercentage > 0 && (
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        {pkg.discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ₹{Math.round(pkg.price / pkg.creditsCount)} per lead
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full text-xs font-bold gap-1"
                    onClick={() => purchaseLeadMutation.mutate(pkg.id)}
                    disabled={purchaseLeadMutation.isPending}
                  >
                    <CreditCard className="h-4 w-4" /> Add Credits
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade Plan Confirm Modal */}
      <Dialog open={isUpgrading} onOpenChange={setIsUpgrading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              Your subscription will be updated immediately. Unlimited leads and featured upgrades
              will be activated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsUpgrading(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPlanId) {
                  subscribeMutation.mutate({ planId: selectedPlanId, billingCycle });
                }
              }}
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? "Updating..." : "Confirm Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Request Modal */}
      <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Apply for Verified Owner Badge
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload your property registration certificate or government identity document to
              display the Verified Owner badge on all listings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Document Type</Label>
              <Input
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                placeholder="e.g. Aadhaar Card, GST Reg, Electricity Bill"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Document Image / PDF Link</Label>
              <Input
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://cloudinary.com/your-doc.pdf"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVerificationModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!docUrl) {
                  toast.error("Please provide a valid document URL");
                  return;
                }
                verifyMutation.mutate({ documentType: docType, documentUrls: [docUrl] });
              }}
              disabled={verifyMutation.isPending}
              className="gap-1.5"
            >
              <Upload className="h-4 w-4" /> Submit Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
