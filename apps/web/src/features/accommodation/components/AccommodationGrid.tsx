import type { Accommodation } from "../types";
import { AccommodationCard } from "./AccommodationCard";

export function AccommodationGrid({ items }: { items: Accommodation[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <AccommodationCard key={a.id} item={a} />
      ))}
    </div>
  );
}
