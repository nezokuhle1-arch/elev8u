import {
  inferCategory,
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

async function fetchMatchedFreelancers(
  matchData: ReturnType<typeof parseMatchReady>,
  categoryHint: string
): Promise<MatchedFreelancer[]> {
  if (!matchData) return [];

  const supabase = await createClient();
  const inferred = inferCategory(matchData.what);
  const category =
    categoryHint && categoryHint !== "undefined" ? categoryHint : inferred;

  let query = supabase
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
    .eq("is_vetted", false)
    .order("rating", { ascending: false })
    .limit(3);

  if (category) {
    query = query.eq("category", category);
  }

  const locationTerm = matchData.where.split(",")[0]?.trim();
  if (locationTerm) {
    query = query.ilike("location", `%${locationTerm}%`);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    const { data: fallback } = await supabase
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
      .eq("is_vetted", false)
      .order("rating", { ascending: false })
      .limit(3);

    if (!fallback) return [];

    return mapFreelancers(fallback as FreelancerRow[]);
  }

  return mapFreelancers(data as FreelancerRow[]);
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

      if (freelancerId) {
        const pinned = await fetchFreelancerById(freelancerId);
        if (pinned) {
          freelancers = [pinned];
          console.log("[concierge] MATCH_READY — pinned freelancer_profiles.id:", pinned.id);
        } else {
          console.warn(
            "[concierge] freelancerId not found, falling back to search:",
            freelancerId
          );
          freelancers = await fetchMatchedFreelancers(matchData, category);
        }
      } else {
        freelancers = await fetchMatchedFreelancers(matchData, category);
      }

      return NextResponse.json({
        reply:
          stripMatchReadyBlock(rawText) ||
          "I found a great match for you!",
        matchReady: true,
        matchData,
        freelancers,
        pinnedFreelancerId: freelancerId || null,
      });
    }

    return NextResponse.json({
      reply: rawText,
      matchReady: false,
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
