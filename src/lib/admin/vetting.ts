export type VettingFreelancer = {
  id: string;
  bio: string | null;
  category: string;
  location: string | null;
  created_at: string;
  full_name: string;
  email: string;
  skills: string[];
  oneTimePrice: number | null;
  subscriptionPrice: number | null;
};

type FreelancerRow = {
  id: string;
  bio: string | null;
  category: string;
  location: string | null;
  created_at: string;
  profiles:
    | { full_name: string; email: string }
    | { full_name: string; email: string }[]
    | null;
  freelancer_skills: { skill: string }[] | null;
  service_tiers: { price: number; type: string }[] | null;
};

export function mapVettingFreelancer(row: FreelancerRow): VettingFreelancer {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const tiers = row.service_tiers ?? [];
  const oneTime = tiers.find((t) => t.type === "one_time");
  const subscription = tiers.find((t) => t.type === "subscription");

  return {
    id: row.id,
    bio: row.bio,
    category: row.category,
    location: row.location,
    created_at: row.created_at,
    full_name: profile?.full_name ?? "Unknown",
    email: profile?.email ?? "",
    skills: (row.freelancer_skills ?? []).map((s) => s.skill),
    oneTimePrice: oneTime ? Number(oneTime.price) : null,
    subscriptionPrice: subscription ? Number(subscription.price) : null,
  };
}

export const VETTING_SELECT = `
  id,
  bio,
  category,
  location,
  created_at,
  profiles!freelancer_profiles_user_id_fkey(full_name, email),
  freelancer_skills(skill),
  service_tiers(price, type)
`;
