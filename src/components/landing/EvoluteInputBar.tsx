"use client";

import { Suspense } from "react";
import { EvoluteInputBarInner } from "./EvoluteInputBarInner";

function InputBarFallback() {
  return (
    <div className="mx-auto h-24 w-full max-w-2xl animate-pulse rounded-2xl bg-white/5" />
  );
}

export default function EvoluteInputBar() {
  return (
    <Suspense fallback={<InputBarFallback />}>
      <EvoluteInputBarInner />
    </Suspense>
  );
}
