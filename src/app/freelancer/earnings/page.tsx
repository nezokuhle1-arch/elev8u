import { BottomNav } from "@/components/freelancer/dashboard/BottomNav";
import { FreelancerAppHeader } from "@/components/freelancer/FreelancerAppHeader";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FreelancerEarningsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/freelancer/earnings");
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

  const initials = getInitials(profile?.full_name ?? "Freelancer");

  const tips = [
    "Share your profile link with clients",
    "Accept leads and share booking links",
    "Offer monthly subscriptions to repeat clients",
    "Build your rating with great service",
  ];

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="relative w-full max-w-[480px] min-h-screen bg-white pb-24 shadow-sm">
        <FreelancerAppHeader
          initials={initials}
          backHref="/freelancer/dashboard"
          title="Earnings"
          showLogo={false}
        />

        <div className="mt-20 px-6 text-center">
          <BarChart3 className="mx-auto mb-6 h-16 w-16 text-[#305CDE]/30" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Earnings &amp; Payments
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-sm text-gray-400">
            Payment tracking and earnings dashboard is coming soon. You&apos;ll
            be able to track all your income, invoices, and subscription revenue
            in one place.
          </p>
          <span className="inline-block rounded-full bg-[#E8EEFB] px-4 py-2 text-sm font-medium text-[#305CDE]">
            Launching with payments in V2
          </span>

          <div className="my-10 border-t border-gray-100" />

          <p className="mb-4 text-sm font-medium text-gray-500">
            In the meantime
          </p>
          <div className="rounded-xl border border-gray-100 p-4 text-left">
            <ul className="space-y-2 text-sm text-gray-500">
              {tips.map((tip) => (
                <li key={tip}>✓ {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
