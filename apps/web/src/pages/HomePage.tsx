import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Search,
  BadgeCheck,
  MessageCircle,
  KeyRound,
  ShieldCheck,
  Eye,
  MapPin,
  Sparkles,
  BookOpen,
  Building2,
  UtensilsCrossed,
  Dumbbell,
  Shirt,
  Bike,
  Star,
  Users,
} from "lucide-react";

import { SiteLayout } from "../components/layout/SiteLayout";
import { HeroSearch } from "../components/common/HeroSearch";
import { INDORE_AREAS } from "../features/accommodation/mock-data/areas";
import { getAccommodations } from "../features/accommodation/services";
import { getLibraries } from "../features/library/services";
import { AccommodationCard } from "../features/accommodation/components/AccommodationCard";
import { LibraryCard } from "../features/library/components/LibraryCard";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const HOW_STEPS = [
  {
    icon: Search,
    title: "Search & Discover",
    desc: "Browse verified PGs, hostels, and silent libraries across Indore.",
  },
  {
    icon: BadgeCheck,
    title: "Filter & Compare",
    desc: "Filter by rent, monthly fee, AC, Wi-Fi, and exact locality.",
  },
  {
    icon: MessageCircle,
    title: "Direct Contact",
    desc: "Send direct inquiries to property and library owners without brokers.",
  },
  {
    icon: KeyRound,
    title: "Settle In Indore",
    desc: "Move into your accommodation and discover local food, laundry, and gyms.",
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "100% Verified Owners",
    desc: "Every owner identity and listing is verified before publishing.",
  },
  {
    icon: Eye,
    title: "Zero Broker Fees",
    desc: "Direct transparent contact with owners. No hidden broker charges.",
  },
  {
    icon: MapPin,
    title: "Indore Student Hubs",
    desc: "Curated listings in Bhawarkua, Vijay Nagar, Geeta Bhawan, Palasia & Old Palasia.",
  },
  {
    icon: Sparkles,
    title: "Aspirant Centric",
    desc: "Tailored specifically for MPPSC, UPSC aspirants, engineering students, and professionals.",
  },
];

const MOCK_MESSES = [
  {
    name: "Shree Ram Thali & Tiffin Service",
    area: "Bhawarkua, Indore",
    price: "₹2,400 / month",
    type: "Pure Veg • Unlimited Thali",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Indori Taste Student Mess",
    area: "Vijay Nagar, Indore",
    price: "₹2,800 / month",
    type: "North & South Indian",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Annapurna Home Tiffin",
    area: "Geeta Bhawan, Indore",
    price: "₹2,200 / month",
    type: "Home Cooked Veg Meals",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=600&q=80",
  },
];

const MOCK_SERVICES = [
  {
    name: "SpeedyClean Student Laundry",
    category: "Laundry & Ironing",
    area: "Bhawarkua",
    icon: Shirt,
    badge: "Doorstep Pickup",
  },
  {
    name: "Iron Fitness 24/7 Gym",
    category: "Gym & Fitness",
    area: "Vijay Nagar",
    icon: Dumbbell,
    badge: "Student Discount",
  },
  {
    name: "Indore EV & Bike Rental",
    category: "Vehicle Rental",
    area: "Geeta Bhawan",
    icon: Bike,
    badge: "Daily / Monthly",
  },
];

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "MPPSC Aspirant, Bhawarkua",
    text: "Finding a quiet 24x7 library near my PG in Bhawarkua was effortless with StudentHub. Direct owner contact saved me 2,000 INR broker fees!",
  },
  {
    name: "Priya Patel",
    role: "IT Professional, Vijay Nagar",
    text: "Moved from Bhopal to Indore for work. Found a verified girls PG with AC and Wi-Fi within 2 hours. Extremely reliable platform!",
  },
  {
    name: "Rohit Verma",
    role: "SGSITS Engineering Student",
    text: "The library discovery feature is a lifesaver during exams. I booked a reserved desk with power backup in Palasia instantly.",
  },
];

export function HomePage() {
  // Fetch real featured accommodations from API
  const { data: accommodationsData, isLoading: loadingAcc } = useQuery({
    queryKey: ["featured-accommodations"],
    queryFn: () => getAccommodations({ limit: 6, sort: "recommended" }),
  });

  // Fetch real featured libraries from API
  const { data: librariesData, isLoading: loadingLib } = useQuery({
    queryKey: ["featured-libraries"],
    queryFn: () => getLibraries({ limit: 6, sort: "recommended" }),
  });

  const featuredAcc = accommodationsData?.items || [];
  const featuredLib = librariesData?.items || [];

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-soft/60 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 bg-primary/10 text-primary border-primary/20"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              #1 Student & Aspirant Platform in Indore, MP
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
              Your Complete Lifestyle in <span className="text-primary">Indore.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              Discover verified PGs, hostels, silent study libraries, mess tiffins, and essential
              local services across Indore.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            <HeroSearch />
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 100% Verified Owners
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-primary" /> Zero Broker Commission
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" /> Bhawarkua, Vijay Nagar, Palasia & More
            </span>
          </div>
        </div>
      </section>

      {/* STATS COUNTER */}
      <section className="border-y border-border bg-card/60 py-8 px-4 md:px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-2 gap-4 md:grid-cols-4 text-center">
          <div>
            <p className="text-3xl font-extrabold text-primary">500+</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Verified Accommodations
            </p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-amber-600">120+</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Silent Study Libraries</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-600">15,000+</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Students & Aspirants</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-purple-600">4.9 / 5</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Average Satisfaction</p>
          </div>
        </div>
      </section>

      {/* POPULAR AREAS IN INDORE */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge
              variant="outline"
              className="mb-2 bg-accent/10 text-accent-foreground border-accent/20"
            >
              <MapPin className="mr-1 h-3 w-3" /> Indore Neighborhoods
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Popular Areas in Indore
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore coaching centers and student hubs loved by aspirants.
            </p>
          </div>
          <Link
            to="/accommodations"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Browse all localities <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDORE_AREAS.map((area) => (
            <Link
              key={area.slug}
              to={`/accommodations?area=${area.name}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/50 shadow-sm"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={area.imageUrl}
                  alt={area.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">{area.name}</h3>
                  <Badge className="bg-white/90 text-black hover:bg-white text-[10px] font-bold">
                    {area.listingCount} Listings
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-white/80 line-clamp-1">{area.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED LIBRARIES */}
      <section className="bg-muted/30 border-y border-border py-16 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <Badge
                variant="outline"
                className="mb-2 bg-amber-500/10 text-amber-600 border-amber-200"
              >
                <BookOpen className="mr-1 h-3 w-3" /> Silent Reading Halls
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Featured Study Libraries
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reserved desks with 24/7 AC, Wi-Fi, and personal lockers.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
              <Link to="/libraries">
                View All Libraries <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-8">
            {loadingLib ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl border border-border bg-card animate-pulse bg-muted/40"
                  />
                ))}
              </div>
            ) : featuredLib.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
                No libraries published yet. Make sure your owner listings are published!
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredLib.slice(0, 3).map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED ACCOMMODATIONS */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge variant="outline" className="mb-2 bg-blue-500/10 text-blue-600 border-blue-200">
              <Building2 className="mr-1 h-3 w-3" /> Verified Stays
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Featured Accommodations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked PGs, hostels, and private rooms in Indore.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
            <Link to="/accommodations">
              View All Accommodations <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {loadingAcc ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-border bg-card animate-pulse bg-muted/40"
                />
              ))}
            </div>
          ) : featuredAcc.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
              No accommodations published yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAcc.slice(0, 3).map((item) => (
                <AccommodationCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED MESSES & FOOD SERVICES */}
      <section className="bg-card border-y border-border py-16 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <Badge
                variant="outline"
                className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-200"
              >
                <UtensilsCrossed className="mr-1 h-3 w-3" /> Mess & Tiffin Services
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Popular Mess & Tiffin Services
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hygienic, home-style meals delivered daily to student rooms.
              </p>
            </div>
            <Badge className="bg-emerald-600 text-white text-xs">Indore Taste Guaranteed</Badge>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_MESSES.map((mess, idx) => (
              <div
                key={idx}
                className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm hover:border-emerald-500/40 transition"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={mess.image}
                    alt={mess.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-black/75 text-white gap-1 text-[11px]">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {mess.rating}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-sm group-hover:text-emerald-600 transition">
                      {mess.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {mess.area}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs font-medium text-foreground">{mess.type}</span>
                    <span className="text-xs font-bold text-emerald-600">{mess.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR LOCAL SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge
              variant="outline"
              className="mb-2 bg-purple-500/10 text-purple-600 border-purple-200"
            >
              <Sparkles className="mr-1 h-3 w-3" /> Student Utilities
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Popular Student Services
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Laundry, gym memberships, and bike rentals around your stay.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {MOCK_SERVICES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-purple-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-200"
                  >
                    {s.badge}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.category} • {s.area}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/30 border-y border-border py-16 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How StudentHub Works</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              From searching in Indore to settling into your new routine in four easy steps.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6 relative">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-muted-foreground/60">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE STUDENTHUB */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Why Students & Aspirants Choose StudentHub
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Built specifically for students relocating to Indore for coaching, exams, and jobs.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-6">
              <t.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-base font-bold text-foreground">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-card border-y border-border py-16 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-200"
            >
              <Users className="mr-1 h-3 w-3" /> Community Feedback
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Loved by Students & Aspirants
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real stories from students living and studying in Indore.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((test, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-background p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{test.text}"
                </p>
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-bold text-foreground">{test.name}</p>
                  <p className="text-[11px] text-muted-foreground">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOR PROPERTY & LIBRARY OWNERS */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
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
                Indore. Zero broker fees, direct lead management.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button size="lg" asChild className="font-semibold text-xs">
                <Link to="/register?role=owner">List Your Business</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="font-semibold text-xs">
                <Link to="/owner/dashboard">Owner Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
