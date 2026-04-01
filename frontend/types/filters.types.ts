// types/filters.ts
// Single source of truth — import this everywhere

export interface FilterState {
  q:        string;   // search bar → ILIKE across title/desc/address
  city:     string;   // dropdown  → exact match
  type:     string;   // dropdown  → exact match
  priceMin: number;   // dropdown  → gte (0 means not set)
  priceMax: number;   // dropdown  → lte (0 means not set)
  page:     number;
  limit:    number;
}

export const DEFAULT_FILTERS: FilterState = {
  q:        "",
  city:     "",
  type:     "",
  priceMin: 0,
  priceMax: 0,
  page:     1,
  limit:    10,
};
