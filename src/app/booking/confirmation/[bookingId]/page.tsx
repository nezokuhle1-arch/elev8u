import { formatBookingDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { Check, Repeat } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/booking/confirmation/${bookingId}`);
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      id,
      client_id,
      scheduled_at,
      notes,
      freelancer_id,
      lead:leads(description),
      freelancer:freelancer_profiles(
        id,
        category,
        profiles!freelancer_profiles_user_id_fkey(full_name)
      )
    `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking || booking.client_id !== user.id) {
    redirect("/client/home");
  }

  const lead = booking.lead as { description: string } | { description: string }[] | null;
  const leadRow = Array.isArray(lead) ? lead[0] : lead;

  const freelancer = booking.freelancer as
    | {
        id: string;
        category: string;
        profiles: { full_name: string } | { full_name: string }[] | null;
      }
    | {
        id: string;
        category: string;
        profiles: { full_name: string } | { full_name: string }[] | null;
      }[]
    | null;
  const freelancerRow = Array.isArray(freelancer) ? freelancer[0] : freelancer;
  const fp = freelancerRow?.profiles;
  const profileRow = Array.isArray(fp) ? fp[0] : fp;
  const freelancerName = profileRow?.full_name ?? "Professional";

  const bookingType =
    booking.notes?.toLowerCase().includes("site") ? "Site visit" : "Phone call";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen max-w-[480px] px-4 py-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E1F5EE]">
            <Check className="h-10 w-10 text-[#1D9E75]" strokeWidth={2.5} />
          </div>
          <h1 className="mt-6 text-2xl font-medium text-[#0F6E56]">
            Booking confirmed!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            You&apos;re all set. Here&apos;s your booking summary.
          </p>
        </div>

        <article className="mt-8 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="font-semibold text-zinc-900">{freelancerName}</p>
          <p className="text-sm text-gray-500">{freelancerRow?.category}</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-gray-400">Date and time</dt>
              <dd className="font-medium text-zinc-900">
                {formatBookingDateTime(booking.scheduled_at)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Type</dt>
              <dd className="font-medium text-zinc-900">{bookingType}</dd>
            </div>
            {leadRow?.description && (
              <div>
                <dt className="text-gray-400">Project</dt>
                <dd className="text-zinc-700">{leadRow.description}</dd>
              </div>
            )}
          </dl>
        </article>

        <div className="mt-6 space-y-3">
          <Link
            href="/client/bookings"
            className="block w-full rounded-lg bg-[#1D9E75] py-3 text-center text-sm font-medium text-white hover:bg-[#0F6E56]"
          >
            View my bookings
          </Link>
          <Link
            href="/client/home"
            className="block w-full rounded-lg border border-gray-200 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-gray-50"
          >
            Back to home
          </Link>
        </div>

        <article className="mt-8 rounded-xl border border-[#534AB7] bg-[#EEEDFE] p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
              <Repeat className="h-5 w-5 text-[#534AB7]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-[#26215C]">
                Love working with {freelancerName}?
              </h2>
              <p className="mt-1 text-sm text-[#534AB7]/80">
                Subscribe to their monthly plan for priority access and better
                rates.
              </p>
              <Link
                href={`/freelancer/${booking.freelancer_id}`}
                className="mt-3 inline-block rounded-lg bg-[#534AB7] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338a8]"
              >
                View subscription plans
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
