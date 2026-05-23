import { ConciergeChat } from "@/components/client/ConciergeChat";
import { Suspense } from "react";

export default function ConciergePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-white">
          <p className="text-zinc-600">Loading Evolute AI…</p>
        </div>
      }
    >
      <ConciergeChat />
    </Suspense>
  );
}
