import { useNavigate } from "react-router-dom";
import { Search, Building2, BookOpen, UtensilsCrossed, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { INDORE_AREAS } from "../../features/accommodation/mock-data/areas";

type Vertical = "accommodation" | "library" | "mess" | "services";

export function HeroSearch() {
  const navigate = useNavigate();
  const [vertical, setVertical] = useState<Vertical>("accommodation");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string>("all");

  const submit = () => {
    const searchParams = new URLSearchParams();
    if (query.trim()) {
      if (vertical === "library") {
        searchParams.set("query", query.trim());
      } else {
        searchParams.set("q", query.trim());
      }
    }
    if (area !== "all") {
      searchParams.set("area", area);
    }

    if (vertical === "library") {
      navigate(`/libraries?${searchParams.toString()}`);
    } else if (vertical === "mess") {
      navigate(`/mess?${searchParams.toString()}`);
    } else if (vertical === "services") {
      navigate(`/services?${searchParams.toString()}`);
    } else {
      navigate(`/accommodations?${searchParams.toString()}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: "accommodation", label: "Accommodations / PGs", icon: Building2 },
          { id: "library", label: "Study Libraries", icon: BookOpen },
          { id: "mess", label: "Messes & Food", icon: UtensilsCrossed },
          { id: "services", label: "Local Services", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = vertical === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setVertical(tab.id as Vertical)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Search Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="grid gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5 sm:grid-cols-[1fr_auto_auto]"
      >
        <div className="flex items-center gap-2 rounded-xl px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              vertical === "library"
                ? "Search library name, silent rooms (e.g. Saarthi, Bhawarkua)..."
                : vertical === "mess"
                  ? "Search tiffin service, mess, thali..."
                  : vertical === "services"
                    ? "Search laundry, gym, bike rental..."
                    : "Search PGs, hostels, private rooms in Indore..."
            }
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
          />
        </div>

        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-full min-w-[150px] border-border bg-background sm:w-auto text-xs">
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas in Indore</SelectItem>
            {INDORE_AREAS.map((a) => (
              <SelectItem key={a.slug} value={a.name}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" size="lg" className="gap-2 text-xs font-semibold">
          <Search className="h-4 w-4" /> Search
        </Button>
      </form>
    </div>
  );
}
