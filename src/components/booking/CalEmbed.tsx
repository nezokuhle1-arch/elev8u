"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CalEmbedProps {
  calLink: string;
  onBookingSuccess?: (data: Record<string, unknown>) => void;
}

export default function CalEmbed({ calLink, onBookingSuccess }: CalEmbedProps) {
  const [loading, setLoading] = useState(true);
  const onSuccessRef = useRef(onBookingSuccess);

  useEffect(() => {
    onSuccessRef.current = onBookingSuccess;
  }, [onBookingSuccess]);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "elev8u-consultation" });
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      cal("on", {
        action: "bookingSuccessful",
        callback: (e: { detail?: Record<string, unknown> }) => {
          if (e.detail && onSuccessRef.current) {
            onSuccessRef.current(e.detail);
          }
        },
      });
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative min-h-[600px] w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex min-h-[600px] flex-col items-center justify-center gap-3 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
          <p className="text-sm text-gray-500">Loading booking calendar...</p>
        </div>
      )}
      <Cal
        namespace="elev8u-consultation"
        calLink={calLink}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "600px",
          overflow: "scroll",
        }}
        config={{
          layout: "month_view",
          useSlotsViewOnSmallScreen: "true",
        }}
      />
    </div>
  );
}
