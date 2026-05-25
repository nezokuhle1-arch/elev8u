import { formatBookingDate } from "@/lib/format";

export type DashboardBooking = {
  id: string;
  scheduled_at: string;
  client_name: string;
  client_location: string | null;
  booking_type: "one_time" | "subscription";
};

type BookingsSectionProps = {
  bookings: DashboardBooking[];
};

export function BookingsSection({ bookings }: BookingsSectionProps) {
  return (
    <section id="bookings" className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Upcoming bookings</h2>
        <a href="/freelancer/calendar" className="text-sm font-medium text-[#305CDE]">
          Calendar
        </a>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-8 text-center">
          <p className="text-sm text-gray-400">No upcoming bookings</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const { day, month, time } = formatBookingDate(booking.scheduled_at);
            const typeLabel =
              booking.booking_type === "subscription"
                ? "Monthly subscriber"
                : "One-time";

            return (
              <article
                key={booking.id}
                className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[#E8EEFB]">
                  <span className="text-xl font-semibold leading-none text-[#1A3FA0]">
                    {day}
                  </span>
                  <span className="mt-0.5 text-xs uppercase text-[#1A3FA0]">
                    {month}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{booking.client_name}</p>
                  <p className="text-sm text-gray-400">
                    {time}
                    {booking.client_location
                      ? ` · ${booking.client_location}`
                      : ""}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-xs text-[#3C3489]">
                    {typeLabel}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
