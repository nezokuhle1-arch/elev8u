"use client";

import CalEmbed from "@/components/booking/CalEmbed";
import { createClient } from "@/lib/supabase/client";
import { formatBudget, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

export type BookingLeadData = {
  id: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  freelancer_id: string;
};

export type BookingFreelancerData = {
  id: string;
  name: string;
  category: string;
  location: string | null;
};

type BookingType = "call" | "site";

type BookingPageClientProps = {
  lead: BookingLeadData;
  freelancer: BookingFreelancerData;
  clientId: string;
  calLink: string;
};

export function BookingPageClient({
  lead,
  freelancer,
  clientId,
  calLink,
}: BookingPageClientProps) {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<BookingType>("call");
  const [saving, setSaving] = useState(false);
  const handledRef = useRef(false);

  const handleBookingSuccess = useCallback(
    async (detail: Record<string, unknown>) => {
      if (handledRef.current || saving) return;
      handledRef.current = true;
      setSaving(true);

      const booking = detail.booking as { startTime?: string } | undefined;
      const scheduledAt =
        (detail.startTime as string | undefined) ??
        booking?.startTime ??
        new Date().toISOString();

      const notes =
        bookingType === "call" ? "Phone / Video call" : "Site visit";

      const supabase = createClient();

      const { data: created, error: insertError } = await supabase
        .from("bookings")
        .insert({
          lead_id: lead.id,
          freelancer_id: lead.freelancer_id,
          client_id: clientId,
          scheduled_at: scheduledAt,
          status: "upcoming",
          notes,
        })
        .select("id")
        .single();

      if (insertError || !created) {
        handledRef.current = false;
        setSaving(false);
        alert(insertError?.message ?? "Could not save booking");
        return;
      }

      const { error: leadError } = await supabase
        .from("leads")
        .update({ status: "completed" })
        .eq("id", lead.id);

      if (leadError) {
        console.error("[booking] lead update:", leadError.message);
      }

      router.push(`/booking/confirmation/${created.id}`);
    },
    [bookingType, clientId, lead, router, saving]
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen max-w-[480px]">
        <header className="flex items-center gap-3 bg-[#0F6E56] px-4 py-3 text-white">
          <Link
            href="/client/home"
            className="rounded-full p-1 hover:bg-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-base font-medium">Book a session</h1>
          <span className="font-medium text-[#E1F5EE]">Elev8U</span>
        </header>

        <div className="px-4 py-4">
          <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-semibold text-[#0F6E56]">
                {getInitials(freelancer.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900">{freelancer.name}</p>
                <p className="text-sm text-gray-500">{freelancer.category}</p>
                {freelancer.location && (
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {freelancer.location}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 truncate text-sm text-gray-500">
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
          </article>

          <h2 className="mt-6 text-sm font-medium text-zinc-900">
            Choose booking type
          </h2>
          <div className="mt-3 grid gap-3">
            <button
              type="button"
              onClick={() => setBookingType("call")}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                bookingType === "call"
                  ? "border-[#1D9E75] bg-[#E1F5EE]"
                  : "border-gray-100 bg-white"
              )}
            >
              <div className="rounded-lg bg-white p-2">
                <Phone className="h-5 w-5 text-[#1D9E75]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900">Phone / Video call</p>
                <p className="text-sm text-gray-500">30 min consultation</p>
              </div>
              <span className="text-sm font-medium text-[#1D9E75]">Free</span>
            </button>

            <button
              type="button"
              onClick={() => setBookingType("site")}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                bookingType === "site"
                  ? "border-[#1D9E75] bg-[#E1F5EE]"
                  : "border-gray-100 bg-white"
              )}
            >
              <div className="rounded-lg bg-white p-2">
                <MapPin className="h-5 w-5 text-[#1D9E75]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900">Site visit</p>
                <p className="text-sm text-gray-500">
                  In-person at your location
                </p>
              </div>
              <span className="text-sm font-medium text-gray-600">
                As quoted
              </span>
            </button>
          </div>

          <div className="relative mt-6">
            <CalEmbed calLink={calLink} onBookingSuccess={handleBookingSuccess} />
            {saving && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
                <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
