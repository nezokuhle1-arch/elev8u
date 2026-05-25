import Link from "next/link";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect information you provide when creating an account, including your name, email address, location, and professional details. We also collect usage data to improve our services.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to match you with relevant professionals or clients, send service notifications, and improve the Elev8U platform. We do not sell your personal data to third parties.",
  },
  {
    title: "Data Security",
    body: "All data is encrypted in transit and at rest. We use Supabase's enterprise-grade security infrastructure. Row Level Security ensures users can only access their own data.",
  },
  {
    title: "Your Rights",
    body: "You may request deletion of your account and associated data at any time by contacting us at privacy@elev8u.co.za",
  },
  {
    title: "Contact",
    body: "For privacy concerns: privacy@elev8u.co.za",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="gradient-hero min-h-screen bg-[#0A1628] text-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-12 text-sm text-white/30">Last updated: May 2026</p>

        {SECTIONS.map((section) => (
          <section key={section.title} className="mb-10">
            <h2 className="mb-3 text-lg font-semibold text-white">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed text-white/50">
              {section.body}
            </p>
          </section>
        ))}

        <Link
          href="/"
          className="glass mt-8 inline-block rounded-xl px-6 py-3 text-white/70 transition-colors hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
