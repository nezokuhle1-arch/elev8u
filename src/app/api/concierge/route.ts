import {
  inferCategory,
  normalizeCategory,
  parseMatchReady,
  stripMatchReadyBlock,
  type ConciergeMessage,
  type MatchedFreelancer,
} from "@/lib/concierge";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Evolute AI — the intelligent matching assistant for Elev8U, a South African freelancer marketplace. Your job is to help clients find the perfect local professional for their needs.

Your personality:
- Friendly and conversational, like a knowledgeable friend
- South African aware (use Rands for currency, reference SA cities)
- Professional but not formal
- Concise — keep responses under 3 sentences unless listing options

Your ONLY job is to collect these 4 pieces of information naturally through conversation:
1. WHAT they need (specific service required)
2. WHERE they are (location/area in SA)
3. BUDGET (what they can afford in Rands)
4. TIMELINE (when they need it done)

Once you have all 4, respond with this EXACT format and nothing else:
MATCH_READY
what: [service description]
where: [location]
budget: [amount in rands]
timeline: [timeline]

Rules:
- Ask for one piece of information at a time
- Never ask for more than one question per message
- If they give multiple pieces of info at once, acknowledge and ask for the next missing piece
- Be encouraging — remind them that Evolute AI and Elev8U have vetted professionals ready to help
- Never discuss anything outside of finding a service professional
- If asked off-topic questions, gently redirect to their service need`;

type FreelancerRow = {
  id: string;
  category: string;
  location: string;
  rating: number;
  profiles: { full_name: string } | { full_name: string }[] | null;
  service_tiers: { price: number }[] | null;
};

function mapFreelancers(rows: FreelancerRow[]): MatchedFreelancer[] {
  return rows.map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const prices = (row.service_tiers ?? []).map((t) => Number(t.price));

    return {
      id: row.id,
      name: profile?.full_name ?? "Professional",
      category: row.category,
      location: row.location,
      rating: Number(row.rating ?? 0),
      priceMin: prices.length ? Math.min(...prices) : null,
      priceMax: prices.length ? Math.max(...prices) : null,
    };
  });
}

async function fetchFreelancerById(
  freelancerId: string
): Promise<MatchedFreelancer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("freelancer_profiles")
    .select(
      `
      id,
      category,
      location,
      rating,
      profiles!freelancer_profiles_user_id_fkey(full_name),
      service_tiers(price)
    `
    )
    .eq("id", freelancerId)
    .maybeSingle();

  if (error) {
    console.error("[concierge] fetchFreelancerById error:", error.message);
    return null;
  }

  if (!data) return null;

  return mapFreelancers([data as FreelancerRow])[0] ?? null;
}

const FREELANCER_SELECT = `
      id,
      category,
      location,
      rating,
      profiles!freelancer_profiles_user_id_fkey(full_name),
      service_tiers(price)
    `;

const FALLBACK_NOTICE =
  "I couldn't find an exact match in your category yet — here are professionals who may be able to help:";

async function fetchMatchedFreelancers(
  matchData: ReturnType<typeof parseMatchReady>,
  categoryHint: string,
  conversationText: string
): Promise<{ freelancers: MatchedFreelancer[]; categoryFallback: boolean }> {
  if (!matchData) return { freelancers: [], categoryFallback: false };

  const supabase = await createClient();
  const category =
    normalizeCategory(categoryHint) ??
    inferCategory(matchData.what) ??
    inferCategory(conversationText);

  const base = () => {
    let q = supabase
      .from("freelancer_profiles")
      .select(FREELANCER_SELECT)
      .eq("is_vetted", true)
      .order("rating", { ascending: false })
      .limit(3);
    if (category) q = q.ilike("category", category);
    return q;
  };

  // 1. Category + location
  const locationTerm = matchData.where.split(",")[0]?.trim();
  if (locationTerm) {
    const { data, error } = await base().ilike("location", `%${locationTerm}%`);
    if (error) console.error("[concierge] freelancer query error:", error.message);
    if (data?.length) {
      return { freelancers: mapFreelancers(data as FreelancerRow[]), categoryFallback: false };
    }
  }

  // 2. Category only (any location)
  const { data: inCategory, error: categoryError } = await base();
  if (categoryError) {
    console.error("[concierge] category query error:", categoryError.message);
  }
  if (inCategory?.length) {
    return { freelancers: mapFreelancers(inCategory as FreelancerRow[]), categoryFallback: false };
  }

  // 3. Nobody in this category: unfiltered fallback, flagged
  if (!category) {
    return { freelancers: [], categoryFallback: false };
  }
  const { data: fallback, error: fallbackError } = await supabase
    .from("freelancer_profiles")
    .select(FREELANCER_SELECT)
    .eq("is_vetted", true)
    .order("rating", { ascending: false })
    .limit(3);
  if (fallbackError) {
    console.error("[concierge] fallback query error:", fallbackError.message);
  }
  return {
    freelancers: fallback?.length ? mapFreelancers(fallback as FreelancerRow[]) : [],
    categoryFallback: !!fallback?.length,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = (body.messages ?? []) as ConciergeMessage[];
    const userLocation = (body.userLocation ?? "") as string;
    const category = (body.category ?? "") as string;
    const freelancerId = (body.freelancerId ?? "") as string;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key is not configured." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    let contextNote = "";
    if (freelancerId) {
      const pinned = await fetchFreelancerById(freelancerId);
      if (pinned) {
        contextNote += `\n\nThe client is enquiring about a specific professional: ${pinned.name} (${pinned.category}, ${pinned.location}). Help them describe their job needs for this professional.`;
      }
    }
    if (userLocation || category) {
      contextNote += `\n\nContext: ${category ? `Category interest: ${category}. ` : ""}${userLocation ? `User location: ${userLocation}.` : ""}`;
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT + contextNote,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const rawText =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    const matchData = parseMatchReady(rawText);

    if (matchData) {
      let freelancers: MatchedFreelancer[] = [];
      let categoryFallback = false;
      const conversationText = messages.map((m) => m.content).join(" ");

      const pinned = freelancerId ? await fetchFreelancerById(freelancerId) : null;
      if (pinned) {
        freelancers = [pinned];
      } else {
        ({ freelancers, categoryFallback } = await fetchMatchedFreelancers(
          matchData,
          category,
          conversationText
        ));
      }

      const baseMessage =
        stripMatchReadyBlock(rawText) || "I found a great match for you!";
      const message = categoryFallback
        ? baseMessage + " " + FALLBACK_NOTICE
        : baseMessage;

      return NextResponse.json({
        message,
        reply: message,
        matchReady: true,
        matchData,
        freelancers: freelancers ?? [],
        pinnedFreelancerId: freelancerId || null,
      });
    }

    return NextResponse.json({
      message: rawText,
      reply: rawText,
      matchReady: false,
      freelancers: [],
    });
  } catch (err) {
    console.error("Concierge API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to process your request.",
      },
      { status: 500 }
    );
  }
}
