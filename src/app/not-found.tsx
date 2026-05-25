import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="gradient-hero flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <p className="mb-4 text-6xl font-bold text-[#6B8EE8]">404</p>
        <h2 className="mb-3 text-2xl font-bold text-white">Page not found</h2>
        <p className="mx-auto mb-8 max-w-sm text-sm text-white/50">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#305CDE] px-6 py-3 text-sm font-medium text-white hover:bg-[#1A3FA0]"
        >
          <Home className="h-4 w-4" />
          Back to Elev8U
        </Link>
      </div>
    </div>
  );
}
