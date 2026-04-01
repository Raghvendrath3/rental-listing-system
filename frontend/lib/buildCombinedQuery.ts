// lib/buildCombinedQuery.ts
// Converts FilterState → URL query string for GET /listings

import { FilterState } from "@/types/filters.types";

export function buildCombinedQuery(filters: FilterState): string {
  const params = new URLSearchParams();

  // ── Search bar → q= (loose ILIKE search on backend) ──────────────────
  if (filters.q.trim()) params.append("q", filters.q.trim());

  // ── Dropdowns → specific exact-match params ───────────────────────────
  if (filters.city) params.append("city", filters.city);
  if (filters.type) params.append("type", filters.type);

  // priceMin/Max: 0 means "not set" — don't send to backend
  if (filters.priceMin > 0) params.append("priceMin", String(filters.priceMin));
  if (filters.priceMax > 0) params.append("priceMax", String(filters.priceMax));

  // ── Pagination — always send ──────────────────────────────────────────
  params.append("page",  String(filters.page  || 1));
  params.append("limit", String(filters.limit || 10));

  return params.toString();
}

// ── Parse price string from suggestion → priceMin/priceMax numbers ────────────
// Used when user selects a price suggestion like "below ₹50 Lakhs"

export function parsePriceSuggestion(text: string): { priceMin: number; priceMax: number } {
  const lower = text.toLowerCase().replace(/[,₹\s]/g, "");

  // Extract all numbers from the string
  const nums = lower.match(/[\d.]+/g)?.map(n => {
    const num = parseFloat(n);
    if (/crore|cr/.test(lower))   return num * 10_000_000;
    if (/lakh|lac|l/.test(lower)) return num * 100_000;
    if (/k/.test(lower))          return num * 1_000;
    return num;
  }) ?? [];

  if (/below|less|under/.test(lower)) return { priceMin: 0,       priceMax: nums[0] ?? 0 };
  if (/above|more|over/.test(lower))  return { priceMin: nums[0] ?? 0, priceMax: 0 };
  if (/between/.test(lower))          return { priceMin: nums[0] ?? 0, priceMax: nums[1] ?? 0 };

  return { priceMin: 0, priceMax: 0 };
}
