"use client";

// SmartSearchBox.tsx
// Responsibilities:
//   1. Show smart suggestions based on detected intent (city, type, price…)
//   2. On suggestion select → call onIntentSelect (city/type → fills dropdown)
//   3. On free-text submit  → call onSearch(q)    (q= search bar text)
//   Does NOT make any API calls itself — parent handles that

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { detectIntent, type IntentResult } from "@/lib/searchIntent";
import { parsePriceSuggestion } from "@/lib/buildCombinedQuery";
import styles from "./SmartSearchBox.module.css";

// ── Props ─────────────────────────────────────────────────────────────────────

interface SmartSearchBoxProps {
  placeholder?: string;
  debounceMs?:  number;
  isLoading?:   boolean;
  // Called on Enter / submit button — always sends q=
  onSearch:     (q: string) => void;
  // Called when user selects a city/type/price suggestion
  // Parent uses this to fill the correct dropdown filter
  onIntentSelect?: (intent: string, value: string, parsed?: { priceMin: number; priceMax: number }) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SmartSearchBox({
  placeholder   = "Search properties, areas, descriptions…",
  debounceMs    = 350,
  isLoading     = false,
  onSearch,
  onIntentSelect,
}: SmartSearchBoxProps) {

  const [query,      setQuery]      = useState("");
  const [isFocused,  setIsFocused]  = useState(false);
  const [activeIdx,  setActiveIdx]  = useState(-1);
  const [isDone,     setIsDone]     = useState(false); // flash on submit

  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, debounceMs);

  // ── Detect intent whenever debounced query changes ────────────────────
  const intent = useMemo(
    () => debouncedQuery.trim() ? detectIntent(debouncedQuery) : null,
    [debouncedQuery]
  );

  const suggestions  = intent?.suggestions ?? [];
  const showDropdown = isFocused && suggestions.length > 0 && !isDone;

  // ── Submit: free-text → always q= ────────────────────────────────────
  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setIsDone(true);
    setIsFocused(false);
    onSearch(trimmed);           // parent gets q=trimmed
    setTimeout(() => setIsDone(false), 800);
  };

  // ── Suggestion click ──────────────────────────────────────────────────
  const handleSuggestionClick = (s: string) => {
    setIsFocused(false);
    setActiveIdx(-1);

    if (!intent) return;

    if (intent.intent === "city") {
      // City suggestion → fill city dropdown, clear search bar
      setQuery("");
      onIntentSelect?.("city", s);

    } else if (intent.intent === "building_type") {
      // Type suggestion → fill type dropdown, clear search bar
      setQuery("");
      onIntentSelect?.("building_type", s);

    } else if (intent.intent === "price") {
      // Price suggestion → parse into priceMin/priceMax, clear search bar
      const parsed = parsePriceSuggestion(s);
      setQuery("");
      onIntentSelect?.("price", s, parsed);

    } else {
      // area, amenity, unknown → treat as q= free-text search
      setQuery(s);
      handleSubmit(s);
    }
  };

  // ── Keyboard navigation ───────────────────────────────────────────────
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(p => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(p => Math.max(p - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0) {
        handleSuggestionClick(suggestions[activeIdx]);
      } else {
        handleSubmit(query);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsDone(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  // Highlight matching part of suggestion
  const highlight = (text: string) => {
    const tokens = query.toLowerCase().split(/\s+/);
    const last   = tokens[tokens.length - 1];
    const idx    = text.toLowerCase().indexOf(last);
    if (!last || idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <strong className={styles.match}>{text.slice(idx, idx + last.length)}</strong>
        {text.slice(idx + last.length)}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>

      {/* Input bar */}
      <div className={[
        styles.bar,
        isFocused          ? styles.barFocused : "",
        isDone && !isLoading ? styles.barDone  : "",
      ].filter(Boolean).join(" ")}>

        {/* Intent badge — shows when intent detected */}
        {intent?.label && query && (
          <span
            className={styles.intentBadge}
            style={{ "--badge-color": intent.color } as React.CSSProperties}
          >
            <span>{intent.icon}</span>
            {intent.label}
          </span>
        )}

        {/* Search icon / loading spinner */}
        <div className={`${styles.iconWrap} ${isLoading ? styles.spin : ""}`}>
          {isLoading ? (
            <svg viewBox="0 0 24 24" fill="none" className={styles.svg}>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className={styles.svg}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsDone(false);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 160)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Debounce pulse — visible while user is still typing */}
        {query && query !== debouncedQuery && (
          <span className={styles.pulse} title="Detecting intent…" />
        )}

        {/* Clear button */}
        {query && (
          <button className={styles.clearBtn} onClick={handleClear} tabIndex={-1}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.svg}>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Submit button */}
        <button
          className={`${styles.submitBtn} ${query ? styles.submitActive : ""}`}
          onClick={() => handleSubmit(query)}
          disabled={!query.trim() || isLoading}
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles.svg}>
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <ul className={styles.dropdown}>
          <li
            className={styles.dropdownHeader}
            style={{ "--badge-color": intent!.color } as React.CSSProperties}
          >
            <span>{intent!.icon}</span>
            <span>Suggestions for <em>{intent!.label}</em></span>
          </li>

          {suggestions.map((s, i) => (
            <li
              key={s}
              className={`${styles.suggestion} ${i === activeIdx ? styles.suggestionActive : ""}`}
              onMouseDown={() => handleSuggestionClick(s)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className={styles.dot} style={{ background: intent!.color }} />
              {highlight(s)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
