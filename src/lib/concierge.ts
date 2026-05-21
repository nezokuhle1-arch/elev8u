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

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Automotive: ["mechanic", "automotive", "car", "vehicle", "brake", "engine"],
  "Graphic Design": ["graphic", "design", "logo", "brand", "poster"],
  Plumbing: ["plumber", "plumbing", "pipe", "leak", "drain"],
  Electrical: ["electrician", "electrical", "wiring", "power"],
  "Web Development": ["web", "website", "developer", "react", "next.js", "app"],
  Photography: ["photographer", "photography", "photo", "shoot"],
  Cleaning: ["cleaning", "cleaner", "housekeeping"],
  "Hair & Beauty": ["hair", "beauty", "salon", "barber", "makeup"],
  Carpentry: ["carpenter", "carpentry", "wood"],
  Tutoring: ["tutor", "tutoring", "teach"],
  Other: [],
};

export function parseMatchReady(text: string): MatchData | null {
  if (!text.includes("MATCH_READY")) return null;

  const what = text.match(/what:\s*(.+)/i)?.[1]?.trim();
  const where = text.match(/where:\s*(.+)/i)?.[1]?.trim();
  const budget = text.match(/budget:\s*(.+)/i)?.[1]?.trim();
  const timeline = text.match(/timeline:\s*(.+)/i)?.[1]?.trim();

  if (!what || !where || !budget || !timeline) return null;

  return { what, where, budget, timeline };
}

export function inferCategory(serviceDescription: string): string | null {
  const lower = serviceDescription.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "Other") continue;
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }

  return null;
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
