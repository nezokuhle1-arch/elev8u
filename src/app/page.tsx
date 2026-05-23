import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[#1D9E75]">
          Elev8U
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Elevate your skills. Find work that pays.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-[#1D9E75] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Join as Freelancer
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#1D9E75] px-6 py-3 text-sm font-medium text-[#1D9E75] transition-colors hover:bg-[#1D9E75]/5"
          >
            Find a Pro
          </Link>
        </div>
      </div>
      <Link
        href="/admin/vetting"
        className="absolute bottom-4 text-xs text-gray-300 hover:text-gray-400"
      >
        Admin
      </Link>
    </div>
  );
}
