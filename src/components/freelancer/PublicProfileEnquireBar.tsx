"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type PublicProfileEnquireBarProps = {
  freelancerId: string;
  lowestPrice: number | null;
  viewerRole: "client" | "freelancer" | null;
};

export function PublicProfileEnquireBar({
  freelancerId,
  lowestPrice,
  viewerRole,
}: PublicProfileEnquireBarProps) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }, []);

  function handleEnquire() {
    if (viewerRole === "freelancer") {
      showToast("Switch to a client account to send enquiries");
      return;
    }

    if (viewerRole === "client") {
      router.push(`/client/concierge?freelancer_id=${freelancerId}`);
      return;
    }

    router.push("/signup");
  }

  return (
    <>
      {toast && (
        <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
        <div className="mx-auto flex max-w-[480px] items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="font-medium text-[#0F6E56]">
              {lowestPrice != null ? `R${lowestPrice}` : "Contact for quote"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleEnquire}
            className="rounded-xl bg-[#1D9E75] px-6 py-3 font-medium text-white hover:bg-[#0F6E56]"
          >
            Send enquiry
          </button>
        </div>
      </div>
    </>
  );
}
