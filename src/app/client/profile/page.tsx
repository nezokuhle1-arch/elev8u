import { ClientBottomNav } from "@/components/client/ClientBottomNav";
import { ClientProfilePage } from "@/components/client/ClientProfilePage";
import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientProfileRoute() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/client/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, location, created_at")
    .eq("id", user.id)
    .single();

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id);

  const fullName = profile?.full_name ?? "Client";
  const initials = getInitials(fullName);

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="relative w-full max-w-[480px] min-h-screen bg-white pb-20 shadow-sm">
        <header className="flex items-center gap-3 bg-[#1A3FA0] px-4 py-3 text-white">
          <Link
            href="/client/home"
            className="rounded-full p-1 hover:bg-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-base font-medium">My Profile</h1>
        </header>

        <ClientProfilePage
          fullName={fullName}
          email={user.email ?? ""}
          location={profile?.location ?? ""}
          memberSince={profile?.created_at ?? new Date().toISOString()}
          bookingsCount={bookingsCount ?? 0}
          initials={initials}
        />
      </div>
      <ClientBottomNav />
    </div>
  );
}
