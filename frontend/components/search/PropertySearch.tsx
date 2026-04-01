"use client";

// PropertySearch.tsx
// The parent that owns ALL state and makes ALL API calls.
// SmartSearchBox and FilterBar are just "dumb" UI components.

import { useState, useCallback, useRef } from "react";
import SmartSearchBox from "@/components/SmartSearchBox";
import { FilterState, DEFAULT_FILTERS } from "@/types/filters.types";
import { buildCombinedQuery } from "@/lib/buildCombinedQuery";

// ── Types matching your backend response ──────────────────────────────────────

interface Listing {
  id:         number;
  title:      string;
  city?:      string;
  type?:      string;
  price?:     number;
  area?:      string;
  amenities?: string[];
}

interface Meta {
  page:       number;
  limit:      number;
  totalItems: number;
  totalPages: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PropertySearch() {
  const [filters,    setFilters]    = useState<FilterState>(DEFAULT_FILTERS);
  const [listings,   setListings]   = useState<Listing[]>([]);
  const [meta,       setMeta]       = useState<Meta | null>(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const apiBase  = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000";

  // ── Core fetch — ALL calls go through here ────────────────────────────
  const fetchListings = useCallback(async (updated: FilterState) => {
    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const qs  = buildCombinedQuery(updated);
      const url = `${apiBase}/listings?${qs}`;

      console.log("→ API call:", url); // helpful during development

      const res = await fetch(url, { signal: abortRef.current.signal });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Error ${res.status}`);
      }

      // Your backend returns: { status, meta, data }
      const json: { status: string; meta: Meta; data: Listing[] } = await res.json();

      setListings(json.data);
      setMeta(json.meta);

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // cancelled — ignore
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setListings([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiBase]);

  // ── Search bar submit → q= ────────────────────────────────────────────
  // User typed free text and pressed Enter or the arrow button
  const handleSearch = (q: string) => {
    const updated = { ...filters, q, page: 1 };
    setFilters(updated);
    fetchListings(updated);
    // Result: GET /listings?q=sea+view+apartment&city=Mumbai&page=1&limit=10
  };

  // ── Suggestion selected → fills specific filter ───────────────────────
  // City/type suggestion → sets that dropdown, clears q
  // Price suggestion     → sets priceMin/priceMax, clears q
  const handleIntentSelect = (
    intent:  string,
    value:   string,
    parsed?: { priceMin: number; priceMax: number }
  ) => {
    let updated: FilterState;

    if (intent === "city") {
      updated = { ...filters, city: value, q: "", page: 1 };
      // Result: GET /listings?city=Mumbai&page=1&limit=10

    } else if (intent === "building_type") {
      updated = { ...filters, type: value, q: "", page: 1 };
      // Result: GET /listings?type=Apartment&page=1&limit=10

    } else if (intent === "price" && parsed) {
      updated = { ...filters, priceMin: parsed.priceMin, priceMax: parsed.priceMax, q: "", page: 1 };
      // Result: GET /listings?priceMax=5000000&page=1&limit=10

    } else {
      return;
    }

    setFilters(updated);
    fetchListings(updated);
  };

  // ── Dropdown filter change ────────────────────────────────────────────
  // When user changes city/type/price dropdowns manually
  const handleFilterChange = (changed: Partial<FilterState>) => {
    const updated = { ...filters, ...changed, page: 1 };
    setFilters(updated);
    fetchListings(updated);
  };

  // ── Pagination ────────────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    fetchListings(updated);
  };

  // ── Reset all filters ─────────────────────────────────────────────────
  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setListings([]);
    setMeta(null);
    setError(null);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div>

      {/* Search bar */}
      <SmartSearchBox
        isLoading={isLoading}
        onSearch={handleSearch}
        onIntentSelect={handleIntentSelect}
      />

      {/* Active filters display */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {filters.city && (
          <ActiveFilter
            label={`📍 ${filters.city}`}
            onRemove={() => handleFilterChange({ city: "" })}
          />
        )}
        {filters.type && (
          <ActiveFilter
            label={`🏠 ${filters.type}`}
            onRemove={() => handleFilterChange({ type: "" })}
          />
        )}
        {filters.priceMin > 0 && (
          <ActiveFilter
            label={`₹ min: ${filters.priceMin.toLocaleString("en-IN")}`}
            onRemove={() => handleFilterChange({ priceMin: 0 })}
          />
        )}
        {filters.priceMax > 0 && (
          <ActiveFilter
            label={`₹ max: ${filters.priceMax.toLocaleString("en-IN")}`}
            onRemove={() => handleFilterChange({ priceMax: 0 })}
          />
        )}
        {filters.q && (
          <ActiveFilter
            label={`🔍 "${filters.q}"`}
            onRemove={() => handleFilterChange({ q: "" })}
          />
        )}
        {(filters.city || filters.type || filters.priceMin || filters.priceMax || filters.q) && (
          <button onClick={handleReset} style={{ fontSize: 12, color: "#888", cursor: "pointer", border: "none", background: "none" }}>
            Clear all
          </button>
        )}
      </div>

      {/* Error */}
      {error && <p style={{ color: "#f87171", marginTop: 12 }}>⚠ {error}</p>}

      {/* Empty state */}
      {!isLoading && listings.length === 0 && meta !== null && (
        <p style={{ color: "#555", marginTop: 20, textAlign: "center" }}>
          No listings found. Try a different search.
        </p>
      )}

      {/* Results */}
      {listings.length > 0 && (
        <>
          <p style={{ color: "#666", fontSize: 12, marginTop: 12 }}>
            {meta?.totalItems} listings found
          </p>

          <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
            {listings.map(item => (
              <li key={item.id} style={{ borderBottom: "1px solid #1e1e2a", padding: "12px 0" }}>
                <strong style={{ color: "#d8d8e8" }}>{item.title}</strong>
                <span style={{ color: "#555", marginLeft: 12, fontSize: 12 }}>
                  {item.city} · {item.type}
                  {item.price ? ` · ₹${item.price.toLocaleString("en-IN")}` : ""}
                </span>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
              <button
                disabled={filters.page <= 1 || isLoading}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                ← Prev
              </button>
              <span style={{ color: "#555", fontSize: 13 }}>
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                disabled={filters.page >= meta.totalPages || isLoading}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Small helper component for active filter chips ────────────────────────────
function ActiveFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 8, fontSize: 12,
      background: "#1a1a24", border: "1px solid #2a2a38", color: "#a0a0b8",
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: 0, lineHeight: 1 }}
      >
        ×
      </button>
    </span>
  );
}
