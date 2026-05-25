import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="gradient-hero min-h-screen bg-[#0A1628] text-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="mb-4 text-sm font-bold tracking-widest text-[#6B8EE8]">
          Elev8U
        </p>
        <h1 className="mb-6 text-4xl font-bold text-white">
          Built for South Africa
        </h1>
        <p className="mb-8 text-lg leading-relaxed text-white/60">
          Elev8U is an AI-powered freelancer marketplace connecting skilled
          South Africans with clients who need real services. We believe every
          skilled person deserves predictable income, and every client deserves a
          professional they can trust.
        </p>
        <p className="mb-8 text-lg leading-relaxed text-white/60">
          Powered by Evolute AI and built by Sentinel Systems, Elev8U uses
          artificial intelligence to vet professionals, qualify leads, and make
          the perfect match — in seconds.
        </p>
        <p className="mt-12 text-sm text-white/25">
          A Sentinel Systems product · South Africa · 2026
        </p>
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
