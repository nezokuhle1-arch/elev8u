import { ConciergeChat } from "@/components/client/ConciergeChat";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

export default async function ConciergePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isGuestMode = !user;

  // #region agent log
  fetch("http://127.0.0.1:7540/ingest/93bcde73-d130-4d09-99cd-abc4ba828e24", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "dcc49e",
    },
    body: JSON.stringify({
      sessionId: "dcc49e",
      runId: "guest-mode-debug",
      hypothesisId: "H1-H3",
      location: "concierge/page.tsx:server",
      message: "server auth check for isGuestMode",
      data: { hasUser: !!user, isGuestMode, userRole: user ? "present" : "none" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
