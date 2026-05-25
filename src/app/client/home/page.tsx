import { Elev8ULogo } from "@/components/ui/Elev8ULogo";
import { ClientBottomNav } from "@/components/client/ClientBottomNav";
import { ClientProfileDropdown } from "@/components/client/ClientProfileDropdown";
import { ClientHomeSearch } from "@/components/client/ClientHomeSearch";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  Bell,
  Camera,
  Car,
  Code,
  Droplets,
  Palette,
  Scissors,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const CATEGORIES = [
  { name: "Automotive", icon: Car },
  { name: "Graphic Design", icon: Palette },
  { name: "Plumbing", icon: Droplets },
  { name: "Electrical", icon: Zap },
  { name: "Web Development", icon: Code },
  { name: "Photography", icon: Camera },
  { name: "Cleaning", icon: Sparkles },
  { name: "Hair & Beauty", icon: Scissors },
] as const;

export default async function ClientHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/client/home");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const categoryCounts = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const { count } = await supabase
        .from("freelancer_profiles")
        .select("*", { count: "exact", head: true })
        .eq("category", cat.name)
        .eq("is_vetted", false);
      return { name: cat.name, count: count ?? 0 };
    })
  );

  const countMap = Object.fromEntries(
    categoryCounts.map((c) => [c.name, c.count])
  );

  const { data: featuredRaw } = await supabase
    .from("freelancer_profiles")
    .select(
      `
      id,
      category,
      location,
      rating,
      profiles!freelancer_profiles_user_id_fkey(full_name)
    `
    )
    .order("rating", { ascending: false })
    .limit(3);

  const featured = (featuredRaw ?? []).map((f) => {
    const p = f.profiles as { full_name: string } | { full_name: string }[] | null;
    const profile = Array.isArray(p) ? p[0] : p;
    return {
      id: f.id,
      name: profile?.full_name ?? "Professional",
      category: f.category,
      location: f.location,
      rating: Number(f.rating ?? 0),
    };
  });

  const fullName = profile?.full_name ?? "Client";
  const initials = getInitials(fullName);

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="relative w-full max-w-[480px] min-h-screen bg-white pb-20 shadow-sm">
        <header className="flex items-center justify-between bg-[#1A3FA0] px-4 py-3 text-white">
          <Elev8ULogo size="sm" theme="dark" href="/client/home" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-1 hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <ClientProfileDropdown initials={initials} />
          </div>
        </header>

        <section
          className="px-4 pb-6 pt-6"
          style={{
            background: "linear-gradient(180deg, #1A3FA0 0%, #305CDE 100%)",
          }}
        >
          <h1 className="text-2xl font-medium text-white">
            Find trusted local professionals
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Describe what you need — our AI will match you with the right person
          </p>
          <div className="mt-6">
            <ClientHomeSearch />
          </div>
        </section>

        <section className="px-4 pt-6">
          <h2 className="text-lg font-medium text-zinc-900">
            Browse by category
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {CATEGORIES.map(({ name, icon: Icon }) => (
              <Link
                key={name}
                href={`/client/concierge?category=${encodeURIComponent(name)}`}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:border-[#305CDE] hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-[#305CDE]" />
                <p className="mt-2 text-sm font-medium text-zinc-900">{name}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {countMap[name] ?? 0} professional
                  {(countMap[name] ?? 0) === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 py-6">
          <h2 className="text-lg font-medium text-zinc-900">
            Top rated professionals
          </h2>
          {featured.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">
              No professionals yet — check back soon.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {featured.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8EEFB] text-sm font-semibold text-[#1A3FA0]">
                    {getInitials(f.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">{f.name}</p>
                    <p className="text-sm text-[#1A3FA0]">{f.category}</p>
                    <p className="text-xs text-gray-400">{f.location}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-[#1A3FA0]">
                      <Star className="h-3.5 w-3.5 fill-[#305CDE] text-[#305CDE]" />
                      {f.rating.toFixed(1)}
                    </div>
                  </div>
                  <Link
                    href={`/freelancer/${f.id}`}
                    className="shrink-0 rounded-lg border border-[#305CDE] px-3 py-1.5 text-xs font-medium text-[#305CDE] hover:bg-[#E8EEFB]"
                  >
                    View profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ClientBottomNav />
    </div>
  );
}
