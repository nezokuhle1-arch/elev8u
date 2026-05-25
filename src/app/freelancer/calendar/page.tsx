import { CalendarPageClient } from "@/components/freelancer/CalendarPageClient";
import { BottomNav } from "@/components/freelancer/dashboard/BottomNav";
import { FreelancerAppHeader } from "@/components/freelancer/FreelancerAppHeader";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FreelancerCalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/freelancer/calendar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: freelancerProfile } = await supabase
    .from("freelancer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!freelancerProfile) {
    redirect("/freelancer/profile/setup");
  }

  const now = new Date().toISOString();

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `
      id,
      lead_id,
      scheduled_at,
      notes,
      status,
      client:profiles!bookings_client_id_fkey(full_name),
      lead:leads(description)
    `
    )
    .eq("freelancer_id", freelancerProfile.id)
    .order("scheduled_at", { ascending: false });

  const all = (bookingsData ?? []).map((b) => {
    const client = b.client as { full_name: string } | { full_name: string }[] | null;
    const clientName = Array.isArray(client)
      ? client[0]?.full_name
      : client?.full_name;
    const lead = b.lead as { description: string } | { description: string }[] | null;
    const leadRow = Array.isArray(lead) ? lead[0] : lead;

    return {
      id: b.id,
      lead_id: b.lead_id,
      scheduled_at: b.scheduled_at,
      notes: b.notes,
      status: b.status,
      client_name: clientName ?? "Client",
      lead_description: leadRow?.description ?? null,
    };
  });

  const upcoming = all.filter(
    (b) =>
      b.status === "upcoming" && new Date(b.scheduled_at) >= new Date(now)
  );
  const past = all.filter(
    (b) =>
      b.status === "completed" ||
      (b.status === "upcoming" && new Date(b.scheduled_at) < new Date(now))
  );

  const initials = getInitials(profile?.full_name ?? "Freelancer");

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="relative w-full max-w-[480px] min-h-screen bg-white pb-24 shadow-sm">
        <FreelancerAppHeader
          initials={initials}
          backHref="/freelancer/dashboard"
          title="Bookings"
          showLogo={false}
        />
        <CalendarPageClient upcoming={upcoming} past={past} />
      </div>
      <BottomNav />
    </div>
  );
}
