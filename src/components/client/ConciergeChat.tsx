"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function ConciergeChat() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <MessageCircle className="h-5 w-5 text-[var(--color-primary)]" />
        <h2 className="font-semibold text-zinc-900">Elev8U Concierge</h2>
      </div>
      <div className="flex flex-1 flex-col justify-end p-4">
        <p className="mb-4 text-sm text-zinc-500">
          Describe what you need and we&apos;ll match you with a vetted pro.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage("");
          }}
        >
          <Input
            placeholder="e.g. I need a plumber in Cape Town..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
