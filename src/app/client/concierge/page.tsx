import { ConciergeChat } from "@/components/client/ConciergeChat";

export default function ConciergePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">AI Concierge</h1>
      <ConciergeChat />
    </div>
  );
}
