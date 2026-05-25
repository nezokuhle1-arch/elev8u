"use client";

import { createClient } from "@/lib/supabase/client";
import { formatBookingDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type CalendarBooking = {
  id: string;
  lead_id: string;
  scheduled_at: string;
  notes: string | null;
  status: string;
  client_name: string;
  lead_description: string | null;
};

type CalendarPageClientProps = {
  upcoming: CalendarBooking[];
  past: CalendarBooking[];
};

export function CalendarPageClient({
  upcoming: initialUpcoming,
  past: initialPast,
}: CalendarPageClientProps) {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [past, setPast] = useState(initialPast);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function copyBookingLink(leadId: string) {
    const url = `${window.location.origin}/booking/${leadId}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Booking link copied!");
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert(url);
    }
  }

  async function markCompleted(booking: CalendarBooking) {
    setUpdatingId(booking.id);
    const supabase = createClient();

    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", booking.id);

    if (bookingError) {
      setUpdatingId(null);
      alert(bookingError.message);
      return;
    }

    await supabase
      .from("leads")
      .update({ status: "completed" })
      .eq("id", booking.lead_id);

    setUpdatingId(null);
    setUpcoming((prev) => prev.filter((b) => b.id !== booking.id));
    setPast((prev) => [
      { ...booking, status: "completed" },
      ...prev,
    ]);
    router.refresh();
  }

  return (
    <div className="px-4 py-4">
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 font-medium text-zinc-900">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-gray-100 py-8 text-center text-sm text-gray-400">
            No upcoming bookings
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                muted={false}
                updatingId={updatingId}
                onCopyLink={() => copyBookingLink(booking.lead_id)}
                onComplete={() => markCompleted(booking)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium text-zinc-900">Past bookings</h2>
        {past.length === 0 ? (
          <p className="rounded-xl border border-gray-100 py-8 text-center text-sm text-gray-400">
            No past bookings yet
          </p>
        ) : (
          <div className="space-y-2">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                muted
                updatingId={updatingId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({
  booking,
  muted,
  updatingId,
  onCopyLink,
  onComplete,
}: {
  booking: CalendarBooking;
  muted: boolean;
  updatingId: string | null;
  onCopyLink?: () => void;
  onComplete?: () => void;
}) {
  const { day, month, time } = formatBookingDate(booking.scheduled_at);
  const typeLabel =
    booking.notes?.toLowerCase().includes("site") ||
    booking.notes === "Site visit"
      ? "Site visit"
      : booking.notes?.toLowerCase().includes("subscription")
        ? "Monthly subscriber"
        : "Phone / Video call";

  return (
    <article
      className={cn(
        "rounded-xl border border-gray-100 bg-white p-3",
        muted && "opacity-75"
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg",
            muted ? "bg-gray-100" : "bg-[#E8EEFB]"
          )}
        >
          <span
            className={cn(
              "text-xl font-semibold leading-none",
              muted ? "text-gray-500" : "text-[#305CDE]"
            )}
          >
            {day}
          </span>
          <span
            className={cn(
              "mt-0.5 text-xs uppercase",
              muted ? "text-gray-400" : "text-[#1A3FA0]"
            )}
          >
            {month}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900">{booking.client_name}</p>
          {booking.lead_description && (
            <p className="line-clamp-2 text-sm text-gray-500">
              {booking.lead_description}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-400">{time}</p>
          <span
            className={cn(
              "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs",
              typeLabel === "Monthly subscriber"
                ? "bg-[#EEEDFE] text-[#3C3489]"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      {!muted && onCopyLink && onComplete && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCopyLink}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#305CDE] bg-[#E8EEFB] py-2 text-sm font-medium text-[#1A3FA0] hover:bg-[#dbe4fb]"
          >
            <Link2 className="h-4 w-4" />
            Share booking link
          </button>
          <button
            type="button"
            disabled={updatingId === booking.id}
            onClick={onComplete}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {updatingId === booking.id ? "Saving…" : "Mark as completed"}
          </button>
        </div>
      )}
    </article>
  );
}
