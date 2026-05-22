import { ClientBottomNav } from "@/components/client/ClientBottomNav";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { Bell, Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/client/bookings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const fullName = profile?.full_name ?? "Client";
  const initials = getInitials(fullName);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto min-h-screen max-w-[480px]">
        <header className="flex items-center justify-between bg-[#0F6E56] px-4 py-3 text-white">
          <span className="font-medium text-[#E1F5EE]">Elev8U</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-1 hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D9E75] text-sm font-semibold"
              aria-label={`${fullName} avatar`}
            >
              {initials}
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center px-4 py-16 text-center">
          <Calendar className="h-16 w-16 text-[#1D9E75]" strokeWidth={1.5} />
          <h1 className="mt-6 text-xl font-medium text-zinc-900">
            Your bookings
          </h1>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Your upcoming bookings will appear here.
          </p>
          <Link
            href="/client/home"
            className="mt-8 rounded-lg bg-[#1D9E75] px-6 py-3 text-sm font-medium text-white hover:bg-[#0F6E56]"
          >
            Find a professional
          </Link>
        </div>

        <ClientBottomNav />
      </div>
    </div>
  );
}
