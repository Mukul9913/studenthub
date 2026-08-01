import type { Library } from "@studenthub/types";

export type { Library, LibraryFacility, LibraryStatus } from "@studenthub/types";

export interface LibraryFilters {
  query: string;
  area: string | "all";
  minFee: number;
  maxFee: number;
  ac: boolean;
  wifi: boolean;
  powerBackup: boolean;
  is24x7: boolean;
  sort: "recommended" | "fee-asc" | "fee-desc" | "rating";
}

export interface PaginatedLibraries {
  items: Library[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
