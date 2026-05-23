"use client";

import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

type PublicProfileHeaderProps = {
  profileUrl: string;
};

export function PublicProfileHeader({ profileUrl }: PublicProfileHeaderProps) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }, []);

  async function handleShare() {
    const url =
      profileUrl.startsWith("http")
        ? profileUrl
        : `${window.location.origin}${profileUrl}`;

    try {
      await navigator.clipboard.writeText(url);
      showToast("Profile link copied!");
    } catch {
      showToast("Could not copy link");
    }
  }

  return (
    <>
      {toast && (
        <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-full p-1 text-zinc-700 hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link href="/" className="font-medium text-[#305CDE]">
          Elev8U
        </Link>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full p-1 text-zinc-700 hover:bg-gray-100"
          aria-label="Share profile"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </header>
    </>
  );
}
