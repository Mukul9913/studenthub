import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Crown, Loader2, BarChart3 } from "lucide-react";
import { SEOHead } from "../../components/seo/SEOHead";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getAdminCRMAnalytics } from "@/services/crm";

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

function BarList({
  data,
  labelKey,
  valueKey,
  label,
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
  label: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{label}</h3>
      <div className="space-y-3">
        {data.slice(0, 8).map((item, i) => {
          const pct = Math.round((Number(item[valueKey]) / max) * 100);
          return (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between">
                <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                  {i + 1}. {String(item[labelKey])}
                </span>
                <span className="ml-2 text-xs font-semibold text-foreground">
                  {Number(item[valueKey]).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No data available</p>
        )}
      </div>
    </div>
  );
}

export function AdminCRMAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-crm-analytics"],
    queryFn: getAdminCRMAnalytics,
  });

  return (
    <>
      <SEOHead
        title="CRM Analytics | StudentHub Admin"
        description="Platform-wide CRM and lead conversion analytics."
      />

      <AdminLayout
        title="CRM Analytics"
        subtitle="Lead performance, conversion rates, and owner leaderboard across StudentHub."
      >
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">No data available.</p>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <KpiCard
                icon={Users}
                label="Total Leads"
                value={data.totalPlatformLeads.toLocaleString("en-IN")}
              />
              <KpiCard
                icon={TrendingUp}
                label="Total Conversions"
                value={data.totalConversions.toLocaleString("en-IN")}
                color="text-emerald-600"
              />
              <KpiCard
                icon={BarChart3}
                label="Platform CVR"
                value={`${data.platformConversionRate}%`}
                color="text-primary"
              />
            </div>

            {/* Top Owners Leaderboard */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-foreground">Top Owners by Conversion Rate</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Leads
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Converted
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        CVR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.topOwnersByConversion.map((owner, i) => (
                      <tr key={owner.ownerId} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `#${i + 1}`}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{owner.ownerName}</td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {owner.totalLeads}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-medium text-emerald-600">
                          {owner.converted}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              owner.conversionRate >= 50
                                ? "bg-emerald-100 text-emerald-700"
                                : owner.conversionRate >= 25
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {owner.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.topOwnersByConversion.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm text-muted-foreground"
                        >
                          No conversion data yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bar lists */}
            <div className="grid gap-5 md:grid-cols-2">
              <BarList
                data={data.popularColleges as unknown as Record<string, string | number>[]}
                labelKey="college"
                valueKey="count"
                label="Top Colleges (Students)"
              />
              <BarList
                data={data.highestConversionAreas as unknown as Record<string, string | number>[]}
                labelKey="area"
                valueKey="leads"
                label="Highest Lead Areas"
              />
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
}
