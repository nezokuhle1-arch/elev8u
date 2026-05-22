import { BookingPageClient } from "@/components/booking/BookingPageClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/booking/${leadId}`);
  }

  const { data: lead } = await supabase
    .from("leads")
    .select(
      "id, client_id, freelancer_id, description, budget_min, budget_max, timeline, status"
    )
    .eq("id", leadId)
    .maybeSingle();

  if (!lead || lead.status !== "accepted") {
    redirect("/client/home");
  }

  if (lead.client_id !== user.id) {
    redirect("/client/home");
  }

  const { data: freelancerProfile } = await supabase
    .from("freelancer_profiles")
    .select(
      `
      id,
      category,
      location,
      profiles!freelancer_profiles_user_id_fkey(full_name)
    `
    )
    .eq("id", lead.freelancer_id)
    .single();

  if (!freelancerProfile) {
    redirect("/client/home");
  }

  const profile = freelancerProfile.profiles as
    | { full_name: string }
    | { full_name: string }[]
    | null;
  const profileRow = Array.isArray(profile) ? profile[0] : profile;

  const calLink =
    process.env.NEXT_PUBLIC_CALCOM_URL?.replace(/^https:\/\/cal\.com\//, "") ||
    "nezokuhle-tshukulwana-mv6jcr/elev8u-consultation";

  return (
    <BookingPageClient
      calLink={calLink}
      lead={{
        id: lead.id,
        description: lead.description,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        timeline: lead.timeline,
        freelancer_id: lead.freelancer_id,
      }}
      freelancer={{
        id: freelancerProfile.id,
        name: profileRow?.full_name ?? "Professional",
        category: freelancerProfile.category,
        location: freelancerProfile.location,
      }}
      clientId={user.id}
    />
  );
}
