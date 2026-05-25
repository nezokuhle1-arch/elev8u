"use client";

import { createClient } from "@/lib/supabase/client";
import { formatBudget, formatTimeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Inbox, Link2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type LeadRow = {
  id: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  status: string;
  created_at: string;
  client_name: string;
  booking_id: string | null;
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
  { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type LeadsPageClientProps = {
  initialLeads: LeadRow[];
};

export function LeadsPageClient({ initialLeads }: LeadsPageClientProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === "all") return leads;
    return leads.filter((l) => l.status === activeTab);
  }, [leads, activeTab]);

  const emptyLabel =
    activeTab === "all"
      ? "leads"
      : activeTab === "pending"
        ? "new leads"
        : `${activeTab} leads`;

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

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    router.refresh();
  }

  async function copyBookingLink(leadId: string) {
    const url = `${window.location.origin}/booking/${leadId}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Booking link copied! Share with your client.");
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert(url);
    }
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto px-4 pb-2 pt-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-[#305CDE] text-white"
                : "text-gray-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white py-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No {emptyLabel} yet
            </p>
          </div>
        ) : (
          filtered.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-gray-100 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-bold text-zinc-900">
                  {lead.client_name}
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={lead.status} />
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(lead.created_at)}
                  </span>
                </div>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                {lead.description}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#E8EEFB] px-2.5 py-0.5 text-xs text-[#1A3FA0]">
                  {formatBudget(lead.budget_min, lead.budget_max)}
                </span>
                {lead.timeline && (
                  <span className="rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-xs text-[#26215C]">
                    {lead.timeline}
                  </span>
                )}
              </div>

              {lead.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={updatingId === lead.id}
                    onClick={() => updateLeadStatus(lead.id, "accepted")}
                    className="flex-1 rounded-lg bg-[#305CDE] py-2 text-sm font-medium text-white hover:bg-[#1A3FA0] disabled:opacity-50"
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

              {lead.status === "accepted" && (
                <button
                  type="button"
                  onClick={() => copyBookingLink(lead.id)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#305CDE] bg-[#E8EEFB] py-2 text-sm font-medium text-[#1A3FA0] hover:bg-[#dbe4fb]"
                >
                  <Link2 className="h-4 w-4" />
                  Share booking link
                </button>
              )}

              {lead.status === "completed" && (
                <Link
                  href="/freelancer/calendar"
                  className="mt-3 block w-full rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-gray-50"
                >
                  View booking
                </Link>
              )}
            </article>
          ))
        )}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <span className="rounded-full bg-[#E8EEFB] px-2 py-0.5 text-xs font-medium text-[#305CDE]">
        New
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        Accepted
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        Declined
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        Completed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      {status}
    </span>
  );
}
