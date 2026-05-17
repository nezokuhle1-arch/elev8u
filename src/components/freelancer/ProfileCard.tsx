import { Card } from "@/components/ui/Card";
import type { FreelancerProfile } from "@/types";

type ProfileCardProps = {
  profile: FreelancerProfile;
};

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-zinc-200" />
        <div>
          <p className="font-semibold text-zinc-900">{profile.category}</p>
          <p className="text-sm text-zinc-600">{profile.location}</p>
          <p className="mt-2 text-sm text-zinc-700">{profile.bio}</p>
          {profile.is_vetted && (
            <span className="mt-2 inline-block rounded-full bg-(--color-primary)/10 px-2 py-0.5 text-xs font-medium text-(--color-primary)">
              Vetted
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
