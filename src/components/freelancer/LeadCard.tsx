import { Card } from "@/components/ui/Card";
import type { Lead } from "@/types";

type LeadCardProps = {
  lead: Lead;
};

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-zinc-500">Lead</p>
      <p className="mt-1 text-zinc-900">{lead.description}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600">
        <span>
          Budget: R{lead.budget_min} – R{lead.budget_max}
        </span>
        <span>Timeline: {lead.timeline}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 capitalize">
          {lead.status}
        </span>
      </div>
    </Card>
  );
}
