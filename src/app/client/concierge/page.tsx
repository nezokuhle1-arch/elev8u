import { ConciergeChat } from "@/components/client/ConciergeChat";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

export default async function ConciergePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isGuestMode = !user;

  return (
    <Suspense
      fallback={
        <div className="flex h-dvh flex-col bg-white">
          <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#1A3FA0] to-[#305CDE] px-4 py-3 text-white">
            <span className="font-medium">Evolute AI</span>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-zinc-600">Loading Evolute AI…</p>
          </div>
        </div>
      }
    >
      <ConciergeChat isGuestMode={isGuestMode} />
    </Suspense>
  );
}
