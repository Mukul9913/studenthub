import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  BadgeCheck,
  MessageCircle,
  KeyRound,
  Eye,
  MapPin,
  Sparkles,
  BookOpen,
  Building2,
  Star,
  Users,
  Brain,
  UtensilsCrossed,
} from "lucide-react";

import { SiteLayout } from "../components/layout/SiteLayout";
import { SEOHead } from "../components/seo/SEOHead";
import { GlobalSearchBar } from "../components/search/GlobalSearchBar";
import { HomeSection } from "../components/home/HomeSection";
import {
  RecommendationCard,
  RecentlyViewedCard,
} from "../components/recommendation/RecommendationCard";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getHomeFeed } from "@/services/recommendation";

const HOW_STEPS = [
  {
    icon: Search,
    title: "Search & Discover",
    desc: "Browse verified PGs, hostels, and silent libraries across Indore.",
  },
  {
    icon: Eye,
    title: "Compare & Shortlist",
    desc: "View galleries, pricing, facilities, and owner profiles side-by-side.",
  },
  {
    icon: MessageCircle,
    title: "Send a Visit Request",
    desc: "Connect with owners directly. No broker fees, no middlemen.",
  },
  {
    icon: KeyRound,
    title: "Move In",
    desc: "Visit the property and move in. 100% hassle-free process.",
  },
];

const QUICK_STATS = [
  { icon: Building2, value: "500+", label: "Verified Listings" },
  { icon: Users, value: "2,000+", label: "Happy Students" },
  { icon: BadgeCheck, value: "100%", label: "Owner Verified" },
  { icon: Star, value: "4.8★", label: "Avg. Rating" },
];

const POPULAR_AREAS = [
  "Vijay Nagar",
  "Palasia",
  "Bhawarkua",
  "South Tukoganj",
  "Rajwada",
  "Geeta Bhawan",
  "MR 10",
];

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "MPPSC Aspirant, Bhawarkua",
    text: "Finding a quiet 24x7 library near my PG in Bhawarkua was effortless with StudentHub. Direct owner contact saved me ₹2,000 in broker fees!",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "IT Professional, Vijay Nagar",
    text: "Moved from Bhopal to Indore for work. Found a verified girls PG with AC and Wi-Fi within 2 hours. Extremely reliable platform!",
    rating: 5,
  },
  {
    name: "Rohit Verma",
    role: "SGSITS Engineering Student",
    text: "The personalized recommendation feature is a lifesaver during exams. Found a reserved desk library with power backup in Palasia instantly.",
    rating: 5,
  },
];

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const { data: feed, isLoading: feedLoading } = useQuery({
    queryKey: ["home-feed", user?.id],
    queryFn: getHomeFeed,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  return (
    <SiteLayout>
      <SEOHead
        title="StudentHub | Find Best PGs, Hostels & Libraries in Indore"
        description="Indore's #1 Marketplace for Students & Aspirants. Discover 100% verified PGs, Hostels, Flats, and 24x7 AC Study Libraries in Bhawarkua, Vijay Nagar, and Palasia."
      />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-soft/60 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 bg-primary/10 text-primary border-primary/20"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isAuthenticated
                ? `Welcome back, ${user?.firstName}!`
                : "#1 Student Platform in Indore, MP"}
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
              {isAuthenticated ? (
                <>
                  Listings picked <span className="text-primary">just for you.</span>
                </>
              ) : (
                <>
                  Your Complete Lifestyle in <span className="text-primary">Indore.</span>
                </>
              )}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              {isAuthenticated
                ? "Personalized PGs, hostels, and study libraries based on your preferences, budget, and browsing history."
                : "Discover verified PGs, hostels, silent study libraries, mess tiffins, and essential local services across Indore."}
            </p>
          </div>

          <div className="mx-auto mt-8 flex justify-center">
            <GlobalSearchBar className="mx-auto" />
          </div>

          {/* Popular Areas */}
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {POPULAR_AREAS.map((area) => (
              <Link
                key={area}
                to={`/accommodations?area=${encodeURIComponent(area)}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <MapPin className="h-3 w-3" />
                {area}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK STATS ──────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50 py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {QUICK_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONALIZED: RECOMMENDED FOR YOU (Authenticated users only) ─────── */}
      {isAuthenticated && (
        <HomeSection
          title="Recommended For You"
          subtitle="Based on your profile, budget, and preferences"
          badge="AI Picks"
          accentColor="bg-primary"
          isLoading={feedLoading}
          isEmpty={!feed?.recommendedForYou?.length}
          viewAllHref={`/libraries`}
        >
          {feed?.recommendedForYou?.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </HomeSection>
      )}

      {/* ── RECENTLY VIEWED (Authenticated users only) ───────────────────────── */}
      {isAuthenticated && !!feed?.recentlyViewed?.length && (
        <HomeSection
          title="Continue Browsing"
          subtitle="Pick up where you left off"
          badge="Recent"
          accentColor="bg-slate-600"
          isEmpty={!feed?.recentlyViewed?.length}
        >
          {feed.recentlyViewed.map((v) => (
            <RecentlyViewedCard
              key={v.id}
              targetType={v.targetType}
              targetId={v.targetId}
              title={v.targetTitle}
              area={v.targetArea}
              rating={v.targetRating}
              price={v.targetPrice}
              viewedAt={v.viewedAt}
            />
          ))}
        </HomeSection>
      )}

      {/* ── POPULAR EDUCATION CENTERS ───────────────────────────────────────── */}
      {/* <section className="py-10 border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Education Ecosystem
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-1">
                Popular Education Centers in Indore
              </h2>
              <p className="text-sm text-muted-foreground">
                Find libraries, PGs, and study cafes around your coaching institute or campus
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Physics Wallah Indore",
                slug: "physics-wallah-indore",
                type: "Coaching Institute",
                area: "Old Palasia",
                desc: "JEE, NEET & Foundation coaching hub.",
                color: "from-blue-600 to-indigo-600",
              },
              {
                name: "Drishti IAS Indore",
                slug: "drishti-ias-indore",
                type: "Coaching Institute",
                area: "Bhawarkua Square",
                desc: "UPSC & MPPSC civil services hub.",
                color: "from-amber-600 to-orange-600",
              },
              {
                name: "Allen Career Institute",
                slug: "allen-indore",
                type: "Coaching Institute",
                area: "LIG Square",
                desc: "Medical & Engineering prep campus.",
                color: "from-emerald-600 to-teal-600",
              },
              {
                name: "Aakash Institute",
                slug: "aakash-indore",
                type: "Coaching Institute",
                area: "Geeta Bhawan",
                desc: "NEET & JEE competitive exam prep.",
                color: "from-sky-600 to-cyan-600",
              },
              {
                name: "Devi Ahilya Vishwavidyalaya (DAVV)",
                slug: "davv-indore",
                type: "State University",
                area: "Khandwa Road & RNT Marg",
                desc: "Grade A+ NAAC Accredited University.",
                color: "from-purple-600 to-pink-600",
              },
              {
                name: "SGSITS Indore",
                slug: "sgsits-indore",
                type: "Autonomous College",
                area: "Park Road, Vallabh Nagar",
                desc: "Premier engineering institute.",
                color: "from-red-600 to-rose-600",
              },
            ].map((ec) => (
              <Link
                key={ec.slug}
                to={`/education-centers/${ec.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      {ec.type}
                    </span>
                    <h3 className="font-bold text-foreground text-base mt-2 group-hover:text-primary transition-colors">
                      {ec.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      {ec.area}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ec.color} text-white shadow`}
                  >
                    <Brain className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{ec.desc}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-primary pt-2 border-t border-border/60">
                  <span>Explore Nearby PGs & Libraries</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── TRENDING STUDY ZONES ────────────────────────────────────────────── */}
      <section className="py-10 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-600" />
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Study Zones
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-1">
                Trending Study Zones in Indore
              </h2>
              <p className="text-sm text-muted-foreground">
                Top student districts with high concentration of 24x7 libraries and hostels
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                name: "Bhawarkua",
                count: "50+ Libraries & PGs",
                tag: "Coaching Capital",
              },
              {
                name: "Vijay Nagar",
                count: "40+ Modern PGs",
                tag: "Tech & Corporate",
              },
              {
                name: "Palasia",
                count: "35+ Silent Desks",
                tag: "Central Hub",
              },
              {
                name: "Geeta Bhawan",
                count: "25+ Hostels",
                tag: "Peaceful Zone",
              },
            ].map((z) => {
              const areaQ = encodeURIComponent(z.name);
              return (
                <div
                  key={z.name}
                  className="group rounded-2xl border border-border bg-card p-4 text-center shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{z.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{z.count}</p>
                  <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {z.tag}
                  </span>
                  <div className="mt-3 flex flex-col gap-1.5">
                    <Link
                      to={`/libraries?area=${areaQ}&is24x7=true`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      24x7 Libraries
                    </Link>
                    <Link
                      to={`/accommodations?area=${areaQ}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      <Building2 className="h-3 w-3" />
                      PGs & Hostels
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── POPULAR NEAR YOU ─────────────────────────────────────────────────── */}
      <HomeSection
        title="Popular Near You"
        subtitle="Top-rated listings in Vijay Nagar, Palasia & Bhawarkua"
        badge="Nearby"
        accentColor="bg-blue-600"
        isLoading={feedLoading}
        isEmpty={!feed?.popularNearYou?.length}
        viewAllHref="/libraries?sort=popular"
      >
        {feed?.popularNearYou?.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </HomeSection>

      {/* ── TRENDING LIBRARIES ───────────────────────────────────────────────── */}
      <HomeSection
        title="Trending Study Libraries"
        subtitle="Most visited libraries in Indore this week"
        badge="Libraries"
        accentColor="bg-primary"
        isLoading={feedLoading}
        isEmpty={!feed?.trendingLibraries?.length}
        viewAllHref="/libraries"
      >
        {feed?.trendingLibraries?.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </HomeSection>

      {/* ── TRENDING PROPERTIES ──────────────────────────────────────────────── */}
      <HomeSection
        title="Trending PGs & Hostels"
        subtitle="Most visited accommodations in Indore this week"
        badge="Properties"
        accentColor="bg-emerald-600"
        isLoading={feedLoading}
        isEmpty={!feed?.trendingProperties?.length}
        viewAllHref="/accommodations"
      >
        {feed?.trendingProperties?.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </HomeSection>

      {/* ── NEW LISTINGS ─────────────────────────────────────────────────────── */}
      <HomeSection
        title="Just Added"
        subtitle="Fresh listings in the last 7 days"
        badge="New"
        accentColor="bg-rose-600"
        isLoading={feedLoading}
        isEmpty={!feed?.newListings?.length}
        viewAllHref="/libraries?sort=newest"
      >
        {feed?.newListings?.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </HomeSection>

      {/* ── BUDGET-FRIENDLY ──────────────────────────────────────────────────── */}
      <HomeSection
        title="Budget-Friendly Picks"
        subtitle="Quality libraries under ₹3,000/month"
        badge="Budget"
        accentColor="bg-green-600"
        isLoading={feedLoading}
        isEmpty={!feed?.budgetFriendly?.length}
        viewAllHref="/libraries?maxFee=3000"
      >
        {feed?.budgetFriendly?.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </HomeSection>

      {/* ── PREMIUM PICKS ────────────────────────────────────────────────────── */}
      <HomeSection
        title="Premium Picks"
        subtitle="Top-rated & verified listings"
        badge="Premium"
        accentColor="bg-amber-600"
        isLoading={feedLoading}
        isEmpty={!feed?.premiumPicks?.length}
        viewAllHref="/libraries?sort=rating_desc"
      >
        {feed?.premiumPicks?.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </HomeSection>

      {/* ── PREFERENCES PROMO (for unauthenticated / no preferences) ─────────── */}
      {isAuthenticated && !feed?.hasPreferences && !feedLoading && (
        <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Get Personalized Recommendations
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tell us your college, budget, and preferred areas. We'll show you listings that
                    are perfect for you.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/dashboard/preferences">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Set Preferences
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── BROWSE BY CATEGORY ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[
            {
              icon: BookOpen,
              label: "Study Libraries",
              sublabel: "24x7 AC, WiFi, CCTV",
              href: "/libraries",
              color: "from-primary to-primary/80",
            },
            {
              icon: UtensilsCrossed,
              label: "Mess & Tiffin",
              sublabel: "Veg, Jain, Monthly Plans",
              href: "/mess",
              color: "from-amber-500 to-amber-600",
            },
            {
              icon: Building2,
              label: "PGs & Hostels",
              sublabel: "Furnished, Meals, AC",
              href: "/accommodations?type=pg",
              color: "from-emerald-500 to-emerald-600",
            },
            {
              icon: MapPin,
              label: "Flats & Rooms",
              sublabel: "1BHK, 2BHK, Studio",
              href: "/accommodations?type=flat",
              color: "from-orange-500 to-orange-600",
            },
            {
              icon: Star,
              label: "Verified Owners",
              sublabel: "Background Checked",
              href: "/libraries?verified=true",
              color: "from-primary to-primary/80",
            },
          ].map(({ icon: Icon, label, sublabel, href, color }) => (
            <Link
              key={label}
              to={href}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card/40 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How StudentHub Works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Find your perfect student accommodation or library in 4 simple steps
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {HOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Loved by Students Across Indore
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map(({ name, role, text, rating }) => (
            <div
              key={name}
              className="rounded-2xl border border-border bg-card p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FOR PROPERTY & LIBRARY OWNERS ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 md:p-12 shadow-sm">
          <div className="grid items-center gap-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                For Business Owners in Indore
              </Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Own a PG, Hostel, or Study Library in Indore?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Connect with thousands of verified students and MPPSC/UPSC aspirants relocating to
                Indore. Zero broker fees, direct lead management with our built-in CRM.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button size="lg" asChild className="font-semibold">
                <Link to="/register?role=owner">List Your Business</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="font-semibold">
                <Link to="/login">Owner Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
