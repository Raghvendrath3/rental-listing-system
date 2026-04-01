// lib/searchIntent.ts
// Detects intent from what user types → shows smart suggestions
// Does NOT build API params — that is buildCombinedQuery's job

export type SearchIntent =
  | "city"
  | "building_type"
  | "price"
  | "area"
  | "amenity"
  | "unknown";

export interface IntentResult {
  intent:      SearchIntent;
  label:       string;   // shown in dropdown header
  color:       string;   // badge accent color
  icon:        string;   // emoji
  suggestions: string[]; // filtered list to show
}

// ── Static suggestion pools ───────────────────────────────────────────────────

const CITY_POOL = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
  "Jabalpur", "Guwahati", "Chandigarh", "Coimbatore", "Kochi",
  "Noida", "Gurgaon", "Faridabad", "Meerut", "Navi Mumbai",
];

const BUILDING_TYPE_POOL = [
  "Apartment", "Villa", "Independent House", "Studio Apartment",
  "Penthouse", "Duplex", "Bungalow", "Row House", "Builder Floor",
  "Farm House", "Service Apartment", "1 BHK", "2 BHK", "3 BHK", "4 BHK",
];

const PRICE_TEMPLATES = [
  "below ₹10 Lakhs", "below ₹25 Lakhs", "below ₹50 Lakhs",
  "below ₹1 Crore",  "below ₹2 Crore",
  "above ₹10 Lakhs", "above ₹25 Lakhs", "above ₹50 Lakhs",
  "above ₹1 Crore",  "above ₹2 Crore",
  "between ₹10L - ₹25L", "between ₹25L - ₹50L",
  "between ₹50L - ₹1Cr", "between ₹1Cr - ₹2Cr",
];

const AREA_POOL = [
  "below 500 sqft", "500 - 1000 sqft", "1000 - 1500 sqft",
  "1500 - 2000 sqft", "above 2000 sqft", "above 3000 sqft",
];

const AMENITY_POOL = [
  "Swimming Pool", "Gym", "Parking", "Garden", "Security",
  "Lift", "Power Backup", "Club House", "Play Area",
  "CCTV", "24x7 Water Supply", "Gated Community",
];

// ── Trigger sets — first word of query matched against these ──────────────────

const CITY_TRIGGERS = new Set([
  "mum", "del", "ban", "hyd", "che", "pun", "kol", "ahm",
  "jai", "sur", "luc", "kan", "nag", "ind", "bho", "jab",
  "guw", "cha", "coi", "koc", "noi", "gur", "far", "mee", "nav",
]);

const BUILDING_TRIGGERS = new Set([
  "apart", "villa", "house", "studio", "pent", "dup",
  "bun", "row", "farm", "flat", "bhk", "1", "2", "3", "4",
]);

const PRICE_TRIGGERS = new Set([
  "above", "below", "less", "more", "under", "over",
  "budget", "price", "cost", "between", "lakh", "crore", "₹", "rs",
]);

const AREA_TRIGGERS = new Set([
  "sqft", "sq", "area", "size", "feet",
]);

const AMENITY_TRIGGERS = new Set([
  "gym", "pool", "park", "lift", "cctv", "power",
  "club", "garden", "parking", "gated", "security",
]);

// ── Main detector ─────────────────────────────────────────────────────────────

export function detectIntent(raw: string): IntentResult {
  const q         = raw.toLowerCase().trim();
  const firstWord = q.split(/\s+/)[0];

  if (!firstWord) return makeUnknown();

  if (matchesTrigger(firstWord, PRICE_TRIGGERS))
    return { intent: "price",         label: "Price",         color: "#34d399", icon: "₹",  suggestions: filterPool(PRICE_TEMPLATES, q) };

  if (matchesTrigger(firstWord, AREA_TRIGGERS))
    return { intent: "area",          label: "Area / Size",   color: "#60a5fa", icon: "📐", suggestions: filterPool(AREA_POOL, q) };

  if (matchesTrigger(firstWord, AMENITY_TRIGGERS))
    return { intent: "amenity",       label: "Amenity",       color: "#f472b6", icon: "✨", suggestions: filterPool(AMENITY_POOL, q) };

  if (matchesTrigger(firstWord, BUILDING_TRIGGERS))
    return { intent: "building_type", label: "Property Type", color: "#fb923c", icon: "🏠", suggestions: filterPool(BUILDING_TYPE_POOL, q) };

  if (matchesTrigger(firstWord, CITY_TRIGGERS))
    return { intent: "city",          label: "City",          color: "#a78bfa", icon: "📍", suggestions: filterPool(CITY_POOL, q) };

  // Fallback: check if it matches city pool directly (e.g. user typed "Jabalpur")
  const cityMatches = filterPool(CITY_POOL, q);
  if (cityMatches.length > 0)
    return { intent: "city",          label: "City",          color: "#a78bfa", icon: "📍", suggestions: cityMatches };

  // Free text — q= search, no suggestions
  return makeUnknown();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesTrigger(word: string, triggers: Set<string>): boolean {
  for (const trigger of triggers) {
    if (word.startsWith(trigger)) return true;
  }
  return false;
}

function filterPool(pool: string[], query: string): string[] {
  const tokens     = query.split(/\s+/);
  const searchToken = tokens[tokens.length - 1]; // match on last typed word
  return pool
    .filter(item => item.toLowerCase().includes(searchToken))
    .slice(0, 7);
}

function makeUnknown(): IntentResult {
  return { intent: "unknown", label: "", color: "#555", icon: "🔍", suggestions: [] };
}
