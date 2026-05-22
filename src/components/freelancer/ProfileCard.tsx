import { Card } from "@/components/ui/Card";
import type { FreelancerProfile } from "@/types";
import Link from "next/link";

type ProfileCardProps = {
  profile: FreelancerProfile;
  showViewProfile?: boolean;
};

export function ProfileCard({
  profile,
  showViewProfile = true,
}: ProfileCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-zinc-200" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-900">{profile.category}</p>
          <p className="text-sm text-zinc-600">{profile.location}</p>
          <p className="mt-2 text-sm text-zinc-700">{profile.bio}</p>
          {profile.is_vetted && (
            <span className="mt-2 inline-block rounded-full bg-[#E1F5EE] px-2 py-0.5 text-xs font-medium text-[#1D9E75]">
              Vetted
            </span>
          )}
          {showViewProfile && (
            <Link
              href={`/freelancer/${profile.id}`}
              className="mt-3 inline-block rounded-lg border border-[#1D9E75] px-3 py-1.5 text-xs font-medium text-[#1D9E75] hover:bg-[#E1F5EE]"
            >
              View profile
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
