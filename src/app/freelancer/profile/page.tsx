import { BottomNav } from "@/components/freelancer/dashboard/BottomNav";
import {
  FreelancerProfileEditor,
  type FreelancerProfileData,
} from "@/components/freelancer/FreelancerProfileEditor";
import { FreelancerAppHeader } from "@/components/freelancer/FreelancerAppHeader";
import type { PortfolioLink } from "@/lib/freelancer/categories";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FreelancerProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/freelancer/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, location")
    .eq("id", user.id)
    .single();

  const { data: freelancerProfile } = await supabase
    .from("freelancer_profiles")
    .select(
      "id, bio, category, location, is_vetted, portfolio_links"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!freelancerProfile) {
    redirect("/freelancer/profile/setup");
  }

  const [{ data: skills }, { data: tiers }] = await Promise.all([
    supabase
      .from("freelancer_skills")
      .select("skill")
      .eq("freelancer_id", freelancerProfile.id),
    supabase
      .from("service_tiers")
      .select("id, name, description, price, type")
      .eq("freelancer_id", freelancerProfile.id),
  ]);

  const portfolioRaw = freelancerProfile.portfolio_links;
  const portfolioLinks: PortfolioLink[] = Array.isArray(portfolioRaw)
    ? (portfolioRaw as PortfolioLink[])
    : [];

  const data: FreelancerProfileData = {
    freelancerId: freelancerProfile.id,
    fullName: profile?.full_name ?? "Freelancer",
    location: freelancerProfile.location ?? profile?.location ?? "",
    category: freelancerProfile.category,
    bio: freelancerProfile.bio ?? "",
    isVetted: freelancerProfile.is_vetted ?? false,
    skills: (skills ?? []).map((s) => s.skill),
    tiers: (tiers ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      price: Number(t.price),
      type: t.type as "one_time" | "subscription",
    })),
    portfolioLinks,
  };

  const initials = getInitials(data.fullName);

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="relative w-full max-w-[480px] min-h-screen bg-white pb-24 shadow-sm">
        <FreelancerAppHeader
          initials={initials}
          backHref="/freelancer/dashboard"
          title="My Profile"
          showLogo={false}
        />
        <FreelancerProfileEditor initial={data} />
      </div>
      <BottomNav />
    </div>
  );
}
