import { ProfileDropdown } from "@/components/freelancer/ProfileDropdown";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type FreelancerAppHeaderProps = {
  initials: string;
  backHref?: string;
  title?: string;
  showLogo?: boolean;
};

export function FreelancerAppHeader({
  initials,
  backHref,
  title,
  showLogo = true,
}: FreelancerAppHeaderProps) {
  return (
    <header className="flex items-center gap-3 bg-[#1A3FA0] px-4 py-3 text-white">
      {backHref ? (
        <Link
          href={backHref}
          className="rounded-full p-1 hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="w-7" />
      )}

      {title ? (
        <h1 className="flex-1 text-base font-medium">{title}</h1>
      ) : showLogo ? (
        <span className="flex-1 text-base font-medium text-[#E8EEFB] sm:text-lg">
          Elev8U
        </span>
      ) : (
        <span className="flex-1" />
      )}

      <ProfileDropdown initials={initials} />
    </header>
  );
}
