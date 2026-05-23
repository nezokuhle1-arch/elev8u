"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ClientHomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    router.push(
      `/client/concierge?message=${encodeURIComponent(trimmed)}`
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-lg"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. I need a mechanic in Soweto..."
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-zinc-800 outline-none placeholder:text-gray-400 sm:text-base"
      />
      <button
        type="submit"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#305CDE] text-white hover:bg-[#1A3FA0]"
        aria-label="Search"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
