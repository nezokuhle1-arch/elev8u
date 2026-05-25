import { BookingsSection } from "@/components/freelancer/dashboard/BookingsSection";
import { BottomNav } from "@/components/freelancer/dashboard/BottomNav";
import {
  LeadsSection,
  type DashboardLead,
} from "@/components/freelancer/dashboard/LeadsSection";
import { FreelancerAppHeader } from "@/components/freelancer/FreelancerAppHeader";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FreelancerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/freelancer/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: freelancerProfile } = await supabase
    .from("freelancer_profiles")
    .select("id, category, location, is_vetted, rating")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!freelancerProfile) {
    redirect("/freelancer/profile/setup");
  }

  const freelancerId = freelancerProfile.id;

  const [
    { count: pendingLeadsCount },
    { count: upcomingBookingsCount },
    { data: leadsData, error: leadsError },
    { data: bookingsData },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("freelancer_id", freelancerId)
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("freelancer_id", freelancerId)
      .eq("status", "upcoming")
      .gte("scheduled_at", new Date().toISOString()),
    supabase
      .from("leads")
      .select(
        `
        id,
        description,
        budget_min,
        budget_max,
        timeline,
        status,
        created_at,
        client:profiles!leads_client_id_fkey(full_name)
      `
      )
      .eq("freelancer_id", freelancerId)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select(
        `
        id,
        scheduled_at,
        notes,
        client:profiles!bookings_client_id_fkey(full_name, location)
      `
      )
      .eq("freelancer_id", freelancerId)
      .eq("status", "upcoming")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(2),
  ]);

  if (leadsError) {
    console.error("[dashboard] leads fetch error:", leadsError.message);
  }

  const leads: DashboardLead[] = (leadsData ?? []).map((lead) => {
    const client = lead.client as { full_name: string } | { full_name: string }[] | null;
    const clientName = Array.isArray(client)
      ? client[0]?.full_name
      : client?.full_name;

    return {
      id: lead.id,
      description: lead.description,
      budget_min: lead.budget_min,
      budget_max: lead.budget_max,
      timeline: lead.timeline,
      status: lead.status,
      created_at: lead.created_at,
      client_name: clientName ?? "Client",
    };
  });

  const bookings = (bookingsData ?? []).map((booking) => {
    const client = booking.client as
      | { full_name: string; location: string | null }
      | { full_name: string; location: string | null }[]
      | null;
    const clientData = Array.isArray(client) ? client[0] : client;

    const bookingType =
      booking.notes === "subscription"
        ? ("subscription" as const)
        : ("one_time" as const);

    return {
      id: booking.id,
      scheduled_at: booking.scheduled_at,
      client_name: clientData?.full_name ?? "Client",
      client_location: clientData?.location ?? null,
      booking_type: bookingType,
    };
  });

  const fullName = profile?.full_name ?? "Freelancer";
  const initials = getInitials(fullName);
  const rating = Number(freelancerProfile.rating ?? 0).toFixed(1);

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="relative w-full max-w-[480px] min-h-screen bg-white pb-24 shadow-sm">
        <FreelancerAppHeader initials={initials} />

        {/* Hero */}
        <section className="bg-[#E8EEFB] px-4 py-5">
          {freelancerProfile.is_vetted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#305CDE] px-2.5 py-1 text-xs font-medium text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Profile live
            </span>
          ) : (
            <div>
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                Pending review
              </span>
              <p className="mt-2 text-xs text-[#1A3FA0]/80">
                Your profile is under review. Leads are still visible to you.
              </p>
            </div>
          )}

          <h1 className="mt-3 text-2xl font-bold text-[#1A3FA0]">{fullName}</h1>
          <p className="mt-1 text-sm text-[#305CDE]">
            {freelancerProfile.category} · {freelancerProfile.location}
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2 px-4 py-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-lg font-medium text-[#305CDE] sm:text-2xl">
              {pendingLeadsCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">New leads</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-lg font-medium text-[#305CDE] sm:text-2xl">
              {upcomingBookingsCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Bookings</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-lg font-medium text-[#305CDE] sm:text-2xl">
              {rating}
            </p>
            <p className="mt-1 text-xs text-gray-400">Rating</p>
          </div>
        </section>

        <LeadsSection initialLeads={leads} />
        <BookingsSection bookings={bookings} />
      </div>

      <BottomNav />
    </div>
  );
}
