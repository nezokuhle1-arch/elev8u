"use client";

import { createClient } from "@/lib/supabase/client";
import { formatBudget, formatTimeAgo } from "@/lib/format";
import { Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type DashboardLead = {
  id: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  status: string;
  created_at: string;
  client_name: string;
};

type LeadsSectionProps = {
  initialLeads: DashboardLead[];
};

export function LeadsSection({ initialLeads }: LeadsSectionProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  async function updateLeadStatus(
    leadId: string,
    status: "accepted" | "declined"
  ) {
    setUpdatingId(leadId);
    const supabase = createClient();

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", leadId);

    setUpdatingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    if (status === "accepted") {
      setAcceptedIds((prev) => new Set(prev).add(leadId));
    } else {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    }

    router.refresh();
  }

  return (
    <section id="leads" className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">New leads</h2>
        <button
          type="button"
          className="text-sm font-medium text-[#1D9E75]"
          onClick={() => {
            document.getElementById("leads")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          View all
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-zinc-700">No new leads yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Your profile is live — leads will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const isAccepted = acceptedIds.has(lead.id);

            return (
              <article
                key={lead.id}
                className="rounded-xl border border-gray-100 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-zinc-900">
                        {lead.client_name}
                      </p>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatTimeAgo(lead.created_at)}
                      </span>
                    </div>
                  </div>
                  {isAccepted ? (
                    <span className="shrink-0 rounded-full bg-[#E1F5EE] px-2 py-0.5 text-xs font-medium text-[#085041]">
                      Accepted
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-[#E1F5EE] px-2 py-0.5 text-xs font-medium text-[#1D9E75]">
                      New
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {lead.description}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#E1F5EE] px-2.5 py-0.5 text-xs text-[#085041]">
                    {formatBudget(lead.budget_min, lead.budget_max)}
                  </span>
                  {lead.timeline && (
                    <span className="rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-xs text-[#26215C]">
                      {lead.timeline}
                    </span>
                  )}
                </div>

                {!isAccepted && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={updatingId === lead.id}
                      onClick={() => updateLeadStatus(lead.id, "accepted")}
                      className="flex-1 rounded-lg bg-[#1D9E75] py-2 text-sm font-medium text-white hover:bg-[#0F6E56] disabled:opacity-50"
                    >
                      {updatingId === lead.id ? "Saving…" : "Accept lead"}
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === lead.id}
                      onClick={() => updateLeadStatus(lead.id, "declined")}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
