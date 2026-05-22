import Link from "next/link";
import { PublicProfileHeader } from "@/components/freelancer/PublicProfileHeader";

export default function FreelancerNotFound() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[480px]">
        <PublicProfileHeader profileUrl="/" />
        <div className="px-4 py-16 text-center">
          <h1 className="text-xl font-medium text-zinc-900">
            This profile doesn&apos;t exist or has been removed
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            The freelancer may have deactivated their account.
          </p>
          <Link
            href="/client/home"
            className="mt-6 inline-block rounded-lg bg-[#1D9E75] px-6 py-3 text-sm font-medium text-white hover:bg-[#0F6E56]"
          >
            Find a professional
          </Link>
        </div>
      </div>
    </div>
  );
}
