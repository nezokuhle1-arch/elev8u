import { VettingDashboard } from "@/components/admin/VettingDashboard";
import { mapVettingFreelancer, VETTING_SELECT } from "@/lib/admin/vetting";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function startOfTodayUtc(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function AdminVettingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/vetting");
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/login?redirectTo=/admin/vetting");
  }

  const todayStart = startOfTodayUtc();

  const [
    { data: pendingRaw },
    { data: approvedRaw },
    { count: pendingCount },
    { count: approvedTodayCount },
    { count: totalActiveCount },
  ] = await Promise.all([
    supabase
      .from("freelancer_profiles")
      .select(VETTING_SELECT)
      .eq("is_vetted", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("freelancer_profiles")
      .select(VETTING_SELECT)
      .eq("is_vetted", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("freelancer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_vetted", false),
    supabase
      .from("freelancer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_vetted", true)
      .gte("vetted_at", todayStart),
    supabase
      .from("freelancer_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_vetted", true),
  ]);

  const initialPending = (pendingRaw ?? []).map((row) =>
    mapVettingFreelancer(row as Parameters<typeof mapVettingFreelancer>[0])
  );
  const initialApproved = (approvedRaw ?? []).map((row) =>
    mapVettingFreelancer(row as Parameters<typeof mapVettingFreelancer>[0])
  );

  return (
    <VettingDashboard
      adminName={adminProfile.full_name}
      initialPending={initialPending}
      initialApproved={initialApproved}
      initialStats={{
        pending: pendingCount ?? initialPending.length,
        approvedToday: approvedTodayCount ?? 0,
        totalActive: totalActiveCount ?? initialApproved.length,
      }}
    />
  );
}
