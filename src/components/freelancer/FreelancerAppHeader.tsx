import { ProfileDropdown } from "@/components/freelancer/ProfileDropdown";
import { Elev8ULogo } from "@/components/ui/Elev8ULogo";
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Elev8ULogo size="sm" theme="dark" />
          <h1 className="truncate text-base font-medium">{title}</h1>
        </div>
      ) : showLogo ? (
        <div className="flex-1">
          <Elev8ULogo size="sm" theme="dark" href="/freelancer/dashboard" />
        </div>
      ) : (
        <span className="flex-1" />
      )}

      <ProfileDropdown initials={initials} />
    </header>
  );
}
