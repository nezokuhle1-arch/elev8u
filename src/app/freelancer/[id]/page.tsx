import { PublicProfileEnquireBar } from "@/components/freelancer/PublicProfileEnquireBar";
import { PublicProfileHeader } from "@/components/freelancer/PublicProfileHeader";
import { formatMemberSince, getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicFreelancerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: freelancer, error } = await supabase
    .from("freelancer_profiles")
    .select(
      `
      id,
      bio,
      category,
      location,
      rating,
      total_reviews,
      is_vetted,
      created_at,
      profiles!freelancer_profiles_user_id_fkey(full_name, avatar_url, location)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !freelancer) {
    notFound();
  }

  const profile = Array.isArray(freelancer.profiles)
    ? freelancer.profiles[0]
    : freelancer.profiles;

  const fullName = profile?.full_name ?? "Professional";
  const displayLocation = freelancer.location ?? profile?.location ?? "";
  const initials = getInitials(fullName);

  const [
    { data: skills },
    { data: tiers },
    { count: completedJobs },
    { data: { user } },
  ] = await Promise.all([
    supabase
      .from("freelancer_skills")
      .select("skill")
      .eq("freelancer_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("service_tiers")
      .select("id, name, description, price, type")
      .eq("freelancer_id", id)
      .order("price", { ascending: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("freelancer_id", id)
      .eq("status", "completed"),
    supabase.auth.getUser(),
  ]);

  let viewerRole: "client" | "freelancer" | null = null;
  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (viewerProfile?.role === "client" || viewerProfile?.role === "freelancer") {
      viewerRole = viewerProfile.role;
    }
  }

  const prices = (tiers ?? []).map((t) => Number(t.price));
  const lowestPrice = prices.length ? Math.min(...prices) : null;
  const rating = Number(freelancer.rating ?? 0).toFixed(1);
  const reviewCount = freelancer.total_reviews ?? 0;
  const memberSince = formatMemberSince(freelancer.created_at);

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="mx-auto max-w-[480px]">
        <PublicProfileHeader profileUrl={`/freelancer/${id}`} />

        {/* Hero */}
        <section className="px-4 py-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E1F5EE] text-2xl font-semibold text-[#0F6E56]">
            {initials}
          </div>
          <h1 className="mt-4 text-2xl font-medium text-zinc-900">{fullName}</h1>
          <span className="mt-2 inline-block rounded-full bg-[#E1F5EE] px-3 py-1 text-sm text-[#0F6E56]">
            {freelancer.category}
          </span>
          {displayLocation && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              {displayLocation}
            </p>
          )}
          <div className="mt-3 flex items-center justify-center gap-1 text-sm text-[#0F6E56]">
            <Star className="h-4 w-4 fill-[#1D9E75] text-[#1D9E75]" />
            <span className="font-medium">{rating}</span>
            <span className="text-gray-400">({reviewCount} reviews)</span>
          </div>
          {freelancer.is_vetted && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#E1F5EE] px-3 py-1 text-xs font-medium text-[#085041]">
              <ShieldCheck className="h-4 w-4 text-[#1D9E75]" />
              Verified by Elev8U
            </span>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2 px-4">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-medium text-[#0F6E56]">
              {completedJobs ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Completed jobs</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-medium text-[#0F6E56]">{rating}</p>
            <p className="mt-1 text-xs text-gray-400">Rating</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-medium text-[#0F6E56]">{memberSince}</p>
            <p className="mt-1 text-xs text-gray-400">Member since</p>
          </div>
        </section>

        {/* About */}
        {freelancer.bio && (
          <section className="px-4 pt-6">
            <h2 className="mb-2 text-base font-medium text-zinc-900">About</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              {freelancer.bio}
            </p>
          </section>
        )}

        {/* Skills */}
        {(skills?.length ?? 0) > 0 && (
          <section className="px-4 pt-6">
            <h2 className="mb-2 text-base font-medium text-zinc-900">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills!.map((s) => (
                <span
                  key={s.skill}
                  className="rounded-full border border-[#5DCAA5] bg-[#E1F5EE] px-3 py-1 text-xs text-[#085041]"
                >
                  {s.skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        <section className="px-4 pt-6 pb-4">
          <h2 className="mb-3 text-base font-medium text-zinc-900">
            Services &amp; Pricing
          </h2>
          {(tiers?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400">No services listed yet.</p>
          ) : (
            tiers!.map((tier) => (
              <article
                key={tier.id}
                className="mb-3 rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-900">{tier.name}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                        tier.type === "subscription"
                          ? "bg-[#EEEDFE] text-[#534AB7]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tier.type === "subscription"
                        ? "Monthly plan"
                        : "One-time"}
                    </span>
                  </div>
                  <p className="shrink-0 font-medium text-[#0F6E56]">
                    R{Number(tier.price)}
                    {tier.type === "subscription" ? "/mo" : ""}
                  </p>
                </div>
                {tier.description && (
                  <p className="mt-2 text-sm text-gray-500">
                    {tier.description}
                  </p>
                )}
              </article>
            ))
          )}
        </section>
      </div>

      <PublicProfileEnquireBar
        freelancerId={id}
        lowestPrice={lowestPrice}
        viewerRole={viewerRole}
      />
    </div>
  );
}
