import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Crown, DollarSign, Plus, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { fetchApi } from "@/services/api";
import type {
  PlanDTO,
  MarketingServiceDTO,
  LeadPackageDTO,
  MonetizationAnalyticsDTO,
} from "@studenthub/types";

export function AdminMonetizationPage() {
  const queryClient = useQueryClient();
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);

  // Form State for New Plan
  const [planForm, setPlanForm] = useState({
    name: "STARTER PLUS",
    code: "starter_plus",
    description: "Enhanced Starter Plan with extra lead quota.",
    priceMonthly: 1499,
    priceAnnual: 14990,
    maxListings: 8,
    monthlyLeadLimit: 150,
    verifiedBadge: true,
  });

  // Fetch Monetization Analytics
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["admin-monetization-analytics"],
    queryFn: () => fetchApi<MonetizationAnalyticsDTO>("/monetization/admin/analytics"),
  });

  // Fetch Plans
  const { data: plansData } = useQuery({
    queryKey: ["admin-monetization-plans"],
    queryFn: () => fetchApi<PlanDTO[]>("/monetization/plans"),
  });

  // Fetch Marketing Services
  const { data: servicesData } = useQuery({
    queryKey: ["admin-marketing-services"],
    queryFn: () => fetchApi<MarketingServiceDTO[]>("/monetization/marketing-services"),
  });

  // Fetch Lead Packages
  const { data: leadPackagesData } = useQuery({
    queryKey: ["admin-lead-packages"],
    queryFn: () => fetchApi<LeadPackageDTO[]>("/monetization/lead-packages"),
  });

  // Create Plan Mutation
  const createPlanMutation = useMutation({
    mutationFn: (newPlan: unknown) =>
      fetchApi("/monetization/plans", {
        method: "POST",
        data: newPlan,
      }),
    onSuccess: () => {
      toast.success("New subscription plan created!");
      queryClient.invalidateQueries({ queryKey: ["admin-monetization-plans"] });
      setCreatePlanModalOpen(false);
    },
  });

  if (loadingAnalytics) {
    return (
      <AdminLayout
        title="Monetization & Plans Control"
        subtitle="Configure SaaS pricing plans, revenue telemetry, and verification approvals."
      >
        <LoadingState />
      </AdminLayout>
    );
  }

  const analytics = analyticsData || {
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    activeSubscriptionsCount: 0,
    subscriptionsByPlan: {},
    pendingVerificationsCount: 0,
    completedMarketingOrdersCount: 0,
    leadCreditsPurchasedCount: 0,
  };

  const plans = plansData || [];
  const services = servicesData || [];
  const leadPackages = leadPackagesData || [];

  return (
    <AdminLayout
      title="Monetization & Revenue Control"
      subtitle="Manage database-driven subscription plans, feature quotas, marketing packages, and verification queue."
    >
      {/* Revenue KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Recurring (MRR)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ₹{analytics.mrr.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ARR: ₹{analytics.arr.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Subscriptions
            </CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {analytics.activeSubscriptionsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paid Business & Pro accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Verifications
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {analytics.pendingVerificationsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Identity documents awaiting audit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Marketing Orders
            </CardTitle>
            <Megaphone className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {analytics.completedMarketingOrdersCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed photoshoots & social promos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="plans" className="mt-8 space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans ({plans.length})</TabsTrigger>
          <TabsTrigger value="services">Marketing Services ({services.length})</TabsTrigger>
          <TabsTrigger value="lead-packages">Lead Credit Bundles</TabsTrigger>
          <TabsTrigger value="verifications">Verification Queue</TabsTrigger>
        </TabsList>

        {/* PLANS MANAGEMENT TAB */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Database Subscription Plans</h3>
              <p className="text-xs text-muted-foreground">
                Dynamic pricing plans stored in database with zero hardcoded limits.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setCreatePlanModalOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" /> Create New Plan
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <Card key={p.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
                      CODE: {p.code}
                    </Badge>
                    {p.isPopular && (
                      <Badge className="bg-primary text-primary-foreground text-[9px]">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold mt-2">{p.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 min-h-[36px]">
                    {p.description}
                  </CardDescription>
                  <div className="mt-3">
                    <span className="text-2xl font-bold">₹{p.priceMonthly}</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Listings:</span>
                    <span className="font-semibold">
                      {p.features.maxListings === -1 ? "Unlimited" : p.features.maxListings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Leads:</span>
                    <span className="font-semibold">
                      {p.features.monthlyLeadLimit === -1
                        ? "Unlimited"
                        : p.features.monthlyLeadLimit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified Badge:</span>
                    <span className="font-semibold">{p.features.verifiedBadge ? "Yes" : "No"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* MARKETING SERVICES TAB */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">One-Time Marketing Catalog</h3>
              <p className="text-xs text-muted-foreground">
                Managed marketing services for photoshoots, Instagram ads, and Local SEO
                positioning.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {services.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <Badge
                    variant="outline"
                    className="w-fit text-[10px] uppercase font-bold text-purple-600 bg-purple-50"
                  >
                    {s.category}
                  </Badge>
                  <CardTitle className="text-base font-bold mt-2">{s.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{s.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xl font-bold text-foreground">₹{s.price}</p>
                  <ul className="text-xs text-muted-foreground space-y-1 border-t border-border pt-2">
                    {s.deliverables.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LEAD PACKAGES TAB */}
        <TabsContent value="lead-packages" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Pay-Per-Lead Credit Packages</h3>
              <p className="text-xs text-muted-foreground">
                Credit bundles for owners purchasing extra leads outside their monthly plan limit.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-4">
            {leadPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="text-base font-bold">{pkg.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {pkg.creditsCount} Lead Credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{pkg.price}</div>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    {pkg.discountPercentage}% Discount
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VERIFICATION QUEUE TAB */}
        <TabsContent value="verifications" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold">Owner Identity & Property Verification Queue</h3>
            <p className="text-xs text-muted-foreground">
              Review government identity documents and grant "Verified Owner" badges to listings.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            No pending document verifications in queue. All owner identity requests are up to date.
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Plan Modal */}
      <Dialog open={createPlanModalOpen} onOpenChange={setCreatePlanModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
            <DialogDescription>
              Define a new DB plan tier with custom feature flags.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Plan Name</Label>
              <Input
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Plan Code</Label>
              <Input
                value={planForm.code}
                onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Monthly Price (₹)</Label>
                <Input
                  type="number"
                  value={planForm.priceMonthly}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, priceMonthly: parseFloat(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Max Listings (-1 = ∞)</Label>
                <Input
                  type="number"
                  value={planForm.maxListings}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, maxListings: parseInt(e.target.value, 10) })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePlanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                createPlanMutation.mutate({
                  name: planForm.name,
                  code: planForm.code,
                  description: planForm.description,
                  priceMonthly: planForm.priceMonthly,
                  priceAnnual: planForm.priceAnnual,
                  features: {
                    maxListings: planForm.maxListings,
                    monthlyLeadLimit: planForm.monthlyLeadLimit,
                    featuredListingsIncluded: 1,
                    marketingCreditsIncluded: 0,
                    verifiedBadge: planForm.verifiedBadge,
                    prioritySupport: false,
                    advancedAnalytics: true,
                    leadExport: true,
                    homepageBanner: false,
                    sponsoredListingsAllowed: false,
                  },
                });
              }}
              disabled={createPlanMutation.isPending}
            >
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
