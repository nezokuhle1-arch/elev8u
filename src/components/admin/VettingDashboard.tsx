"use client";

import { createClient } from "@/lib/supabase/client";
import type { VettingFreelancer } from "@/lib/admin/vetting";
import { formatTimeAgo, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

type VettingDashboardProps = {
  adminName: string;
  initialPending: VettingFreelancer[];
  initialApproved: VettingFreelancer[];
  initialStats: {
    pending: number;
    approvedToday: number;
    totalActive: number;
  };
};

type Tab = "pending" | "approved";

export function VettingDashboard({
  adminName,
  initialPending,
  initialApproved,
  initialStats,
}: VettingDashboardProps) {
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState(initialPending);
  const [approved, setApproved] = useState(initialApproved);
  const [stats, setStats] = useState(initialStats);
  const [toast, setToast] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  function animateRemove(id: string, onDone: () => void) {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onDone();
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }

  async function handleApprove(freelancer: VettingFreelancer) {
    setUpdatingId(freelancer.id);
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("freelancer_profiles")
      .update({ is_vetted: true, vetted_at: now })
      .eq("id", freelancer.id);

    setUpdatingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    animateRemove(freelancer.id, () => {
      setPending((prev) => prev.filter((f) => f.id !== freelancer.id));
      setApproved((prev) => [freelancer, ...prev]);
      setStats((prev) => ({
        pending: Math.max(0, prev.pending - 1),
        approvedToday: prev.approvedToday + 1,
        totalActive: prev.totalActive + 1,
      }));
      showToast(`${freelancer.full_name} is now live on Elev8U!`);
    });
  }

  async function handleConfirmReject(freelancer: VettingFreelancer) {
    setUpdatingId(freelancer.id);
    const supabase = createClient();

    const { error } = await supabase
      .from("freelancer_profiles")
      .delete()
      .eq("id", freelancer.id);

    setUpdatingId(null);
    setRejectingId(null);
    setRejectReason("");

    if (error) {
      alert(error.message);
      return;
    }

    animateRemove(freelancer.id, () => {
      setPending((prev) => prev.filter((f) => f.id !== freelancer.id));
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
      }));
      showToast(`${freelancer.full_name}'s profile has been removed`);
    });
  }

  async function handleRevoke(freelancer: VettingFreelancer) {
    setUpdatingId(freelancer.id);
    const supabase = createClient();

    const { error } = await supabase
      .from("freelancer_profiles")
      .update({ is_vetted: false, vetted_at: null })
      .eq("id", freelancer.id);

    setUpdatingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    animateRemove(freelancer.id, () => {
      setApproved((prev) => prev.filter((f) => f.id !== freelancer.id));
      setPending((prev) => [freelancer, ...prev]);
      setStats((prev) => ({
        pending: prev.pending + 1,
        approvedToday: prev.approvedToday,
        totalActive: Math.max(0, prev.totalActive - 1),
      }));
      showToast(`${freelancer.full_name} moved back to pending review`);
    });
  }

  const list = tab === "pending" ? pending : approved;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen max-w-[600px]">
        <header className="flex items-center justify-between bg-[#0F6E56] px-4 py-3 text-white">
          <span className="text-lg font-bold text-[#1D9E75]">Elev8U</span>
          <span className="text-sm font-medium">Admin · Vetting</span>
          <span className="max-w-[120px] truncate text-sm text-[#E1F5EE]">
            {adminName}
          </span>
        </header>

        <div className="grid grid-cols-3 gap-3 px-4 py-4">
          <StatCard label="Pending review" value={stats.pending} />
          <StatCard label="Approved today" value={stats.approvedToday} />
          <StatCard label="Total active" value={stats.totalActive} />
        </div>

        <div className="flex border-b border-gray-200 px-4">
          {(["pending", "approved"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-3 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "border-b-2 border-[#1D9E75] text-[#1D9E75]"
                  : "text-gray-400"
              )}
            >
              {t === "pending" ? "Pending review" : "Approved"}
            </button>
          ))}
        </div>

        <div className="px-4 py-4">
          {list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            list.map((freelancer) => (
              <FreelancerCard
                key={freelancer.id}
                freelancer={freelancer}
                tab={tab}
                isRemoving={removingIds.has(freelancer.id)}
                isUpdating={updatingId === freelancer.id}
                isRejecting={rejectingId === freelancer.id}
                rejectReason={rejectReason}
                onRejectReasonChange={setRejectReason}
                onApprove={() => handleApprove(freelancer)}
                onStartReject={() => {
                  setRejectingId(freelancer.id);
                  setRejectReason("");
                }}
                onCancelReject={() => {
                  setRejectingId(null);
                  setRejectReason("");
                }}
                onConfirmReject={() => handleConfirmReject(freelancer)}
                onRevoke={() => handleRevoke(freelancer)}
              />
            ))
          )}
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
      <p className="text-2xl font-semibold text-[#0F6E56]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  if (tab === "pending") {
    return (
      <div className="py-16 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-[#1D9E75]" />
        <p className="mt-4 font-medium text-zinc-700">
          All caught up! No profiles pending review.
        </p>
      </div>
    );
  }

  return (
    <div className="py-16 text-center">
      <p className="font-medium text-zinc-700">No approved freelancers yet</p>
    </div>
  );
}

type FreelancerCardProps = {
  freelancer: VettingFreelancer;
  tab: Tab;
  isRemoving: boolean;
  isUpdating: boolean;
  isRejecting: boolean;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onApprove: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onConfirmReject: () => void;
  onRevoke: () => void;
};

function FreelancerCard({
  freelancer,
  tab,
  isRemoving,
  isUpdating,
  isRejecting,
  rejectReason,
  onRejectReasonChange,
  onApprove,
  onStartReject,
  onCancelReject,
  onConfirmReject,
  onRevoke,
}: FreelancerCardProps) {
  const location = freelancer.location ?? "Location not set";

  return (
    <article
      className={cn(
        "mb-3 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300",
        isRemoving && "mb-0 max-h-0 scale-95 opacity-0 py-0"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-semibold text-[#0F6E56]">
          {getInitials(freelancer.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-zinc-900">{freelancer.full_name}</p>
              <p className="truncate text-sm text-gray-400">{freelancer.email}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-full bg-[#E1F5EE] px-2 py-1 text-xs text-[#0F6E56]">
                {freelancer.category}
              </span>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(freelancer.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        {location}
      </p>

      {freelancer.bio && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{freelancer.bio}</p>
      )}

      {freelancer.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {freelancer.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#E1F5EE] px-2 py-0.5 text-xs text-[#085041]"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
        {freelancer.oneTimePrice != null && (
          <span>R{freelancer.oneTimePrice} per job</span>
        )}
        {freelancer.subscriptionPrice != null && (
          <span>R{freelancer.subscriptionPrice}/mo</span>
        )}
      </div>

      {tab === "pending" && !isRejecting && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={onApprove}
            className="flex-1 rounded-lg bg-[#1D9E75] p-2 text-sm font-medium text-white hover:bg-[#0F6E56] disabled:opacity-50"
          >
            {isUpdating ? "Saving…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onStartReject}
            className="flex-1 rounded-lg border border-red-200 bg-red-50 p-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {tab === "pending" && isRejecting && (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            placeholder="Reason for rejection (optional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-300"
          />
          <button
            type="button"
            disabled={isUpdating}
            onClick={onConfirmReject}
            className="w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirm rejection
          </button>
          <button
            type="button"
            onClick={onCancelReject}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {tab === "approved" && (
        <div className="mt-4 flex gap-2">
          <Link
            href={`/freelancer/${freelancer.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-gray-50"
          >
            View profile
          </Link>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onRevoke}
            className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Revoke approval
          </button>
        </div>
      )}
    </article>
  );
}
