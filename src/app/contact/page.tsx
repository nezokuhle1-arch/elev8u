import { Mail, Users } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="gradient-hero min-h-screen bg-[#0A1628] text-white">
      <div className="mx-auto max-w-xl px-6 py-24">
        <p className="text-sm font-bold tracking-widest text-[#6B8EE8]">
          Contact
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">Get in touch</h1>
        <p className="mt-3 text-white/50">
          Have a question or want to partner with Elev8U? We&apos;d love to hear
          from you.
        </p>

        <div className="glass-card mt-10 rounded-2xl p-6">
          <div className="glass-card mb-3 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#6B8EE8]" />
              <span className="text-sm text-white/70">hello@elev8u.co.za</span>
            </div>
            <p className="mt-2 text-xs text-white/40">
              For general enquiries, partnerships, and press.
            </p>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#6B8EE8]" />
              <span className="text-sm text-white/70">
                support@elev8u.co.za
              </span>
            </div>
            <p className="mt-2 text-xs text-white/40">Freelancer support</p>
          </div>
        </div>

        <a
          href="#"
          className="glass mt-8 inline-block rounded-xl px-6 py-3 text-white/60 transition-colors hover:text-white"
        >
          Follow us on LinkedIn
        </a>

        <Link
          href="/"
          className="glass mt-4 block rounded-xl px-6 py-3 text-center text-white/70 transition-colors hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
