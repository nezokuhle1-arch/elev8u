import EvoluteInputBar from "@/components/landing/EvoluteInputBar";
import ParticleBackground from "@/components/landing/ParticleBackground";
import { ServiceOrbital } from "@/components/landing/ServiceOrbital";
import {
  CheckCircle,
  MapPin,
  Palette,
  Repeat,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const GRADIENT_TEXT = {
  background: "linear-gradient(135deg, #305CDE, #6B8EE8, #a5b8f0)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

const CLIENT_STEPS = [
  {
    title: "Describe your need",
    body: "Tell Evolute AI what you need in plain language. No forms, no searching.",
  },
  {
    title: "Get AI-matched instantly",
    body: "Evolute AI qualifies your request and matches you with vetted local professionals.",
  },
  {
    title: "Book and get it done",
    body: "Book directly on their calendar. Subscribe monthly for recurring services.",
  },
] as const;

const FREELANCER_STEPS = [
  {
    title: "Build your profile",
    body: "Create your profile in under 10 minutes. Set your pricing, list your skills.",
  },
  {
    title: "Get vetted & go live",
    body: "Our team reviews your profile within 24-48 hours. Then you're discoverable by clients.",
  },
  {
    title: "Earn predictably",
    body: "Accept AI-qualified leads and convert clients to monthly subscribers for stable income.",
  },
] as const;

const STATS = [
  { value: "4M+", label: "Discouraged work-seekers in SA" },
  { value: "R95M+", label: "SA freelance market size" },
  { value: "18-20%", label: "Annual market growth" },
  { value: "24hrs", label: "Profile vetting turnaround" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* NAVBAR */}
      <nav className="glass-strong fixed left-0 right-0 top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">Elev8U</span>
            <span className="glass ml-3 hidden rounded-full px-3 py-1 text-xs text-white/70 sm:inline">
              Powered by Evolute AI
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
            >
              How it works
            </a>
            <a
              href="#categories"
              className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
            >
              Categories
            </a>
            <a
              href="#for-freelancers"
              className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
            >
              For Freelancers
            </a>
          </div>

          <div className="flex items-center">
            <Link
              href="/login"
              className="mr-4 text-sm text-white/60 transition-colors duration-200 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#305CDE] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#305CDE]/25 transition-all duration-200 hover:bg-[#1A3FA0]"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="gradient-hero relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-24">
        <ParticleBackground />

        <div className="pointer-events-none absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-[#305CDE]/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[#4B6EE8]/15 blur-[80px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#305CDE]/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="glass mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white/80">
            🇿🇦 Built for South Africa · AI-Powered Matching
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Find trusted local
            <br />
            <span style={GRADIENT_TEXT}>professionals.</span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
            Elev8U connects skilled South Africans with clients who need real
            services. Describe what you need and Evolute AI finds your perfect
            match in seconds.
          </p>

          <EvoluteInputBar />

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: ShieldCheck, label: "AI-Vetted Pros" },
              { icon: MapPin, label: "Local to You" },
              { icon: Star, label: "Transparent Pricing" },
              { icon: Repeat, label: "Subscribe & Save" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/70"
              >
                <Icon className="h-4 w-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5 bg-[#060d1f] px-6 py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <p className="text-3xl font-bold text-[#6B8EE8]">{value}</p>
              <p className="mt-1 text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EVOLUTE AI SECTION HEADER */}
      <section className="bg-[#0A1628] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/70">
            <Sparkles className="h-4 w-4" />
            Evolute AI · Powered by Claude
          </span>

          <h2 className="mb-4 text-4xl font-bold text-white">
            The smartest way to find{" "}
            <span style={GRADIENT_TEXT}>the right professional</span>
          </h2>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/45">
            Type what you need. Evolute AI handles the rest — qualifying the
            request, matching you to vetted professionals, and connecting you
            instantly.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "✓ Natural language input",
              "✓ 4-point lead verification",
              "✓ Instant professional matching",
              "✓ Direct booking from chat",
            ].map((item) => (
              <span
                key={item}
                className="glass flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES ORBITAL */}
      <section id="categories" className="bg-[#060d1f] px-6 py-20">
        <h2 className="mb-3 text-center text-3xl font-bold text-white">
          Every service, one platform
        </h2>
        <p className="mb-16 text-center text-white/40">
          Vetted professionals across every category
        </p>
        <ServiceOrbital />
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#0A1628] px-6 py-20">
        <h2 className="mb-3 text-center text-3xl font-bold text-white">
          How Elev8U works
        </h2>
        <p className="mb-16 text-center text-white/40">
          From problem to professional in minutes
        </p>

        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <div>
            <p className="mb-8 text-xs font-bold tracking-widest text-[#305CDE]">
              FOR CLIENTS
            </p>
            {CLIENT_STEPS.map((step, i) => (
              <div key={step.title} className="relative mb-8 flex gap-4">
                {i < CLIENT_STEPS.length - 1 && (
                  <span className="absolute bottom-0 left-5 top-10 w-px bg-[#305CDE]/20" />
                )}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#305CDE] text-sm font-bold text-white shadow-lg shadow-[#305CDE]/30">
                  {i + 1}
                </div>
                <div>
                  <p className="mb-1 font-semibold text-white">{step.title}</p>
                  <p className="text-sm leading-relaxed text-white/45">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-8 text-xs font-bold tracking-widest text-[#6B8EE8]">
              FOR FREELANCERS
            </p>
            {FREELANCER_STEPS.map((step, i) => (
              <div key={step.title} className="relative mb-8 flex gap-4">
                {i < FREELANCER_STEPS.length - 1 && (
                  <span className="absolute bottom-0 left-5 top-10 w-px bg-[#6B8EE8]/20" />
                )}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B8EE8] text-sm font-bold text-white shadow-lg shadow-[#6B8EE8]/30">
                  {i + 1}
                </div>
                <div>
                  <p className="mb-1 font-semibold text-white">{step.title}</p>
                  <p className="text-sm leading-relaxed text-white/45">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION */}
      <section id="for-freelancers" className="bg-[#060d1f] px-6 py-20">
        <div className="glass-strong mx-auto max-w-5xl rounded-3xl border border-[#305CDE]/20 bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] p-10 shadow-2xl shadow-[#305CDE]/10">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                NEW
              </span>
              <h2 className="mb-4 text-3xl font-bold text-white">
                Subscribe to your favourite professional
              </h2>
              <p className="mb-6 text-base leading-relaxed text-white/50">
                Stop searching every time. Subscribe to a trusted mechanic,
                designer, or developer monthly. Predictable costs for you.
                Stable income for them.
              </p>
              <ul className="space-y-2">
                {[
                  "Vetted professionals only",
                  "Cancel anytime",
                  "Priority booking included",
                  "Lower rates vs one-time",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="glass-strong mb-4 rounded-2xl p-5">
                <div className="inline-flex rounded-xl bg-white/10 p-2">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <p className="mt-2 text-xs text-white/50">Automotive</p>
                <p className="mt-2 font-semibold text-white">
                  Monthly Maintenance Plan
                </p>
                <p className="mt-1 text-2xl font-bold text-[#6B8EE8]">
                  From R850/mo
                </p>
                <ul className="mt-2 space-y-1 text-xs text-white/50">
                  <li>✓ 2 visits per month</li>
                  <li>✓ Priority WhatsApp support</li>
                </ul>
              </div>

              <div className="glass-strong rounded-2xl p-5">
                <div className="inline-flex rounded-xl bg-white/10 p-2">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <p className="mt-2 text-xs text-white/50">Graphic Design</p>
                <p className="mt-2 font-semibold text-white">Design Retainer</p>
                <p className="mt-1 text-2xl font-bold text-[#6B8EE8]">
                  From R2,000/mo
                </p>
                <ul className="mt-2 space-y-1 text-xs text-white/50">
                  <li>✓ 10 social media graphics</li>
                  <li>✓ 2 revisions per asset</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="gradient-hero relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-[#305CDE]/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[#4B6EE8]/15 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Ready to elevate your income?
          </h2>
          <p className="mb-10 text-lg text-white/75">
            Join the movement. Find work that pays. Build the future with
            Sentinel Systems.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-2xl bg-white px-10 py-4 font-semibold text-[#305CDE] shadow-lg transition-all duration-200 hover:bg-gray-50"
            >
              Join as Freelancer
            </Link>
            <Link
              href="/signup"
              className="glass rounded-2xl border border-white/30 px-10 py-4 text-white transition-all duration-200 hover:bg-white/20"
            >
              Find a Professional
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030812] px-6 py-12 text-white/30">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="mb-2 text-xl font-bold text-white">Elev8U</p>
            <p className="text-sm text-white/30">
              Elevate your skills. Find work that pays.
            </p>
            <p className="mt-3 text-xs text-white/20">
              A Sentinel Systems product.
            </p>
            <div className="glass mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5">
              <Sparkles className="h-3 w-3 text-[#6B8EE8]/70" />
              <span className="text-xs text-[#6B8EE8]/70">
                Powered by Evolute AI
              </span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-white/50">Platform</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/signup"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  Find a Pro
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  Join as Freelancer
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#for-freelancers"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-white/50">Company</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/25 transition-colors hover:text-white/60"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
          <p className="text-xs text-white/15">
            © 2026 Sentinel Systems (Pty) Ltd · Built with ❤️ for South Africa
          </p>
          <Link
            href="/admin/vetting"
            className="text-xs text-[#030812] transition-colors hover:text-white/10"
          >
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
