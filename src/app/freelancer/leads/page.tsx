import { BottomNav } from "@/components/freelancer/dashboard/BottomNav";
import { FreelancerAppHeader } from "@/components/freelancer/FreelancerAppHeader";
import {
  LeadsPageClient,
  type LeadRow,
} from "@/components/freelancer/LeadsPageClient";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FreelancerLeadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/freelancer/leads");
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

  const { data: leadsData } = await supabase
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
      client:profiles!leads_client_id_fkey(full_name),
      bookings(id)
    `
    )
    .eq("freelancer_id", freelancerProfile.id)
    .order("created_at", { ascending: false });

  const leads: LeadRow[] = (leadsData ?? []).map((lead) => {
    const client = lead.client as
      | { full_name: string }
      | { full_name: string }[]
      | null;
    const clientName = Array.isArray(client)
      ? client[0]?.full_name
      : client?.full_name;

    const bookings = lead.bookings as { id: string }[] | { id: string } | null;
    const bookingList = Array.isArray(bookings)
      ? bookings
      : bookings
        ? [bookings]
        : [];

    return {
      id: lead.id,
      description: lead.description,
      budget_min: lead.budget_min,
      budget_max: lead.budget_max,
      timeline: lead.timeline,
      status: lead.status,
      created_at: lead.created_at,
      client_name: clientName ?? "Client",
      booking_id: bookingList[0]?.id ?? null,
    };
  });

  const fullName = profile?.full_name ?? "Freelancer";
  const initials = getInitials(fullName);

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="relative w-full max-w-[480px] min-h-screen bg-white pb-24 shadow-sm">
        <FreelancerAppHeader
          initials={initials}
          backHref="/freelancer/dashboard"
          title="All leads"
          showLogo={false}
        />

        <LeadsPageClient initialLeads={leads} />
      </div>

      <BottomNav />
    </div>
  );
}
