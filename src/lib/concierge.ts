export type ConciergeMessage = {
  role: "user" | "assistant";
  content: string;
};

export type MatchData = {
  what: string;
  where: string;
  budget: string;
  timeline: string;
};

export type MatchedFreelancer = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  priceMin: number | null;
  priceMax: number | null;
};

// Order matters: more specific categories first ("web design" must not fall
// through to the generic "design" keyword of Graphic Design).
const CATEGORY_KEYWORDS: [string, RegExp][] = [
  [
    "Web Development",
    /\b(web ?design|web ?site|web ?developer|web ?development|web ?app|web|react|next\.?js)\b/i,
  ],
  ["Graphic Design", /\b(logo|graphic|design|designer|brand|poster)\b/i],
  ["Automotive", /\b(car|mechanic|vehicle|automotive|brake|engine)\b/i],
  ["Copywriting", /\b(writer|writing|content|copy|copywriter|copywriting)\b/i],
  ["Photography", /\b(photo|photos|photographer|photography|shoot)\b/i],
  ["Cleaning", /\b(clean|cleaner|cleaning|housekeeping)\b/i],
  ["Hair & Beauty", /\b(hair|beauty|salon|barber|makeup)\b/i],
  ["Plumbing", /\b(plumber|plumbing|pipe|leak|drain)\b/i],
  ["Electrical", /\b(electrician|electrical|wiring)\b/i],
  ["Carpentry", /\b(carpenter|carpentry|wood)\b/i],
  ["Tutoring", /\b(tutor|tutoring|teach)\b/i],
];

export function parseMatchReady(text: string): MatchData | null {
  if (!text.includes("MATCH_READY")) return null;

  const what = text.match(/what:\s*(.+)/i)?.[1]?.trim();
  const where = text.match(/where:\s*(.+)/i)?.[1]?.trim();
  const budget = text.match(/budget:\s*(.+)/i)?.[1]?.trim();
  const timeline = text.match(/timeline:\s*(.+)/i)?.[1]?.trim();

  if (!what || !where || !budget || !timeline) return null;

  return { what, where, budget, timeline };
}

export function inferCategory(text: string): string | null {
  for (const [category, pattern] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

/** Case-insensitive map of a category name or client phrase to a canonical category. */
export function normalizeCategory(input: string | null | undefined): string | null {
  const value = (input ?? "").trim();
  if (!value || value === "undefined") return null;
  const exact = CATEGORY_KEYWORDS.find(
    ([name]) => name.toLowerCase() === value.toLowerCase()
  );
  return exact ? exact[0] : inferCategory(value);
}

export function parseBudgetRange(budget: string): {
  budget_min: number | null;
  budget_max: number | null;
} {
  const numbers = budget.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10)) ?? [];

  if (numbers.length >= 2) {
    return {
      budget_min: Math.min(...numbers),
      budget_max: Math.max(...numbers),
    };
  }
  if (numbers.length === 1) {
    return { budget_min: numbers[0], budget_max: numbers[0] };
  }
  return { budget_min: null, budget_max: null };
}

export function stripMatchReadyBlock(text: string): string {
  const idx = text.indexOf("MATCH_READY");
  if (idx === -1) return text.trim();
  return text.slice(0, idx).trim();
}
