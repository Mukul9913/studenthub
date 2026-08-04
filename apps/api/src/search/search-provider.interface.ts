import type {
  SearchQueryParams,
  SearchResultItem,
  SearchSuggestionResponse,
} from "@studenthub/types";

export interface ISearchProviderResult {
  items: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  nextCursor?: string;
}

export interface ISearchProvider {
  search(params: SearchQueryParams): Promise<ISearchProviderResult>;
  getSuggestions(query: string, city?: string): Promise<SearchSuggestionResponse>;
  getSimilarListings(
    targetType: string,
    targetId: string,
    limit?: number,
  ): Promise<SearchResultItem[]>;
  getNearbyListings(
    lat: number,
    lng: number,
    radiusKm?: number,
    targetType?: string,
    limit?: number,
  ): Promise<SearchResultItem[]>;
}
