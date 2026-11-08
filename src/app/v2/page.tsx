import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/v2/Hero";
import { DashboardPreview } from "@/components/v2/DashboardPreview";
import { AgentShowcase } from "@/components/v2/AgentShowcase";
import { TrustFooter } from "@/components/v2/TrustFooter";
import styles from "./v2.module.css";

export const metadata: Metadata = {
  title: "Join the Elev8U V2 waitlist",
  description:
    "V2 brings AI agents that draft your replies, grow your leads and handle the admin. Join the waitlist to be first in line.",
  alternates: {
    canonical: "/v2",
  },
  openGraph: {
    title: "Join the Elev8U V2 waitlist",
    description:
      "V2 brings AI agents that draft your replies, grow your leads and handle the admin.",
    url: "/v2",
    siteName: "Elev8U",
    images: [{ url: "/og/waitlist.jpg", width: 1200, height: 630 }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Elev8U V2 waitlist",
    description:
      "V2 brings AI agents that draft your replies, grow your leads and handle the admin.",
    images: ["/og/waitlist.jpg"],
  },
};

export default async function WaitlistPage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: count }] = await Promise.all([
    supabase.from("app_settings").select("waitlist_open").eq("id", 1).single(),
    supabase.rpc("get_waitlist_count"),
  ]);

  const waitlistOpen = settings?.waitlist_open ?? true;
  const nextPosition = (typeof count === "number" ? count : 0) + 1;

  return (
    <div className={styles.page}>
      <Hero waitlistOpen={waitlistOpen} nextPosition={nextPosition} />
      <DashboardPreview />
      <AgentShowcase />
      <TrustFooter />
    </div>
  );
}
