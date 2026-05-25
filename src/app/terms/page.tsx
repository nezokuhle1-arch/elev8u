import Link from "next/link";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: "By using Elev8U you agree to these terms. Elev8U is operated by Sentinel Systems (Pty) Ltd, South Africa.",
  },
  {
    title: "Use of the Platform",
    body: "Elev8U connects freelancers with clients. Users must provide accurate information. Fraudulent profiles will be removed immediately.",
  },
  {
    title: "Payments & Subscriptions",
    body: "All payments are agreed between clients and freelancers directly. Elev8U facilitates connections but is not responsible for payment disputes in V1.",
  },
  {
    title: "Vetting & Verification",
    body: "Elev8U manually vets all freelancer profiles. Vetting does not guarantee the quality of services rendered.",
  },
  {
    title: "Limitation of Liability",
    body: "Elev8U is not liable for disputes between clients and freelancers. Users engage each other at their own risk.",
  },
  {
    title: "Contact",
    body: "legal@elev8u.co.za",
  },
] as const;

export default function TermsPage() {
  return (
    <div className="gradient-hero min-h-screen bg-[#0A1628] text-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="mb-2 text-3xl font-bold text-white">Terms of Service</h1>
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
