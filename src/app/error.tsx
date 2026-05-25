"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="mb-2 text-center text-xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-[#305CDE] px-6 py-3 text-sm font-medium text-white hover:bg-[#1A3FA0]"
      >
        Try again
      </button>
    </div>
  );
}
