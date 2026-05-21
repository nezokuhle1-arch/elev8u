"use client";

import { createClient } from "@/lib/supabase/client";
import {
  parseBudgetRange,
  type MatchData,
  type MatchedFreelancer,
} from "@/lib/concierge";
import { getInitials } from "@/lib/format";
import { ArrowLeft, Send, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const OPENING_MESSAGE =
  "Hi! 👋 I'm your Elev8U assistant. I'll help you find the perfect local professional. What kind of service are you looking for today?";

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConciergeChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [freelancers, setFreelancers] = useState<MatchedFreelancer[]>([]);
  const [enquirySent, setEnquirySent] = useState<Record<string, boolean>>({});
  const [enquiryLoading, setEnquiryLoading] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState("");

  const categoryParam = searchParams.get("category") ?? "";
  const messageParam = searchParams.get("message") ?? "";
  const freelancerIdParam = searchParams.get("freelancer_id") ?? "";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, freelancers, scrollToBottom]);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirectTo=/client/concierge");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user.id)
        .single();
      if (profile?.location) setUserLocation(profile.location);
    }
    loadProfile();
  }, [router]);

  const sendToApi = useCallback(
    async (history: ChatMessage[], category: string) => {
      setIsLoading(true);

      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userLocation,
          category,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              data.error ?? "Sorry, something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        },
      ]);

      if (data.matchReady && data.matchData) {
        setMatchData(data.matchData);
        setFreelancers(data.freelancers ?? []);
      }
    },
    [userLocation]
  );

  const sendMessage = useCallback(
    async (text: string, category: string = categoryParam) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      await sendToApi(history, category);
    },
    [isLoading, messages, sendToApi, categoryParam]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function init() {
      if (messageParam) {
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: messageParam,
          timestamp: new Date(),
        };
        setMessages([userMsg]);
        setIsLoading(true);
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: messageParam }],
            userLocation,
            category: categoryParam,
          }),
        });
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.reply,
              timestamp: new Date(),
            },
          ]);
          if (data.matchReady && data.matchData) {
            setMatchData(data.matchData);
            setFreelancers(data.freelancers ?? []);
          }
        }
        return;
      }

      if (categoryParam) {
        const text = `I'm looking for a ${categoryParam} professional`;
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          timestamp: new Date(),
        };
        setMessages([userMsg]);
        setIsLoading(true);
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: text }],
            userLocation,
            category: categoryParam,
          }),
        });
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.reply,
              timestamp: new Date(),
            },
          ]);
          if (data.matchReady && data.matchData) {
            setMatchData(data.matchData);
            setFreelancers(data.freelancers ?? []);
          }
        }
        return;
      }

      if (freelancerIdParam) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Great choice! Tell me what you need help with and I'll match you with the right professional.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: OPENING_MESSAGE,
          timestamp: new Date(),
        },
      ]);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSendEnquiry(freelancer: MatchedFreelancer) {
    if (!matchData) return;

    setEnquiryLoading(freelancer.id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirectTo=/client/concierge");
      return;
    }

    const { budget_min, budget_max } = parseBudgetRange(matchData.budget);

    // freelancer.id is freelancer_profiles.id (not profiles.id / auth uid)
    const { error } = await supabase.from("leads").insert({
      client_id: user.id,
      freelancer_id: freelancer.id,
      description: matchData.what,
      budget_min,
      budget_max,
      timeline: matchData.timeline,
      status: "pending",
    });

    setEnquiryLoading(null);

    if (error) {
      alert(error.message);
      return;
    }

    setEnquirySent((prev) => ({ ...prev, [freelancer.id]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex h-dvh flex-col bg-white">
      <header className="flex shrink-0 items-center gap-3 bg-[#0F6E56] px-4 py-3 text-white">
        <Link
          href="/client/home"
          className="rounded-full p-1 hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="font-medium">Elev8U Assistant</p>
          <p className="text-xs text-white/70">AI-powered matching</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "rounded-2xl rounded-tr-none bg-[#1D9E75] text-white"
                    : "rounded-2xl rounded-tl-none bg-gray-100 text-zinc-800"
                }`}
              >
                {msg.content}
              </div>
              <span className="mt-1 text-xs text-gray-400">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="flex gap-1 rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              </div>
            </div>
          )}

          {freelancers.length > 0 && matchData && (
            <div className="rounded-xl border border-[#1D9E75]/30 bg-[#E1F5EE]/50 p-4">
              <h3 className="mb-3 font-semibold text-[#085041]">
                Matched professionals
              </h3>
              <div className="space-y-3">
                {freelancers.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border border-gray-100 bg-white p-3"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-semibold text-[#0F6E56]">
                        {getInitials(f.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900">{f.name}</p>
                        <p className="text-sm text-[#0F6E56]">{f.category}</p>
                        <p className="text-xs text-gray-400">{f.location}</p>
                        <div className="mt-1 flex items-center gap-1 text-sm text-[#0F6E56]">
                          <Star className="h-3.5 w-3.5 fill-[#1D9E75] text-[#1D9E75]" />
                          {f.rating.toFixed(1)}
                          {f.priceMin != null && (
                            <span className="ml-2 text-gray-500">
                              R{f.priceMin}
                              {f.priceMax != null && f.priceMax !== f.priceMin
                                ? ` – R${f.priceMax}`
                                : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/client/concierge?freelancer_id=${f.id}`}
                        className="flex-1 rounded-lg border border-[#1D9E75] py-2 text-center text-sm font-medium text-[#1D9E75] hover:bg-[#E1F5EE]"
                      >
                        View profile
                      </Link>
                      <button
                        type="button"
                        disabled={
                          enquiryLoading === f.id || enquirySent[f.id]
                        }
                        onClick={() => handleSendEnquiry(f)}
                        className="flex-1 rounded-lg bg-[#1D9E75] py-2 text-sm font-medium text-white hover:bg-[#0F6E56] disabled:opacity-60"
                      >
                        {enquirySent[f.id]
                          ? "Enquiry sent ✓"
                          : enquiryLoading === f.id
                            ? "Sending…"
                            : "Send enquiry"}
                      </button>
                    </div>
                    {enquirySent[f.id] && (
                      <p className="mt-2 text-center text-xs text-[#085041]">
                        Your enquiry has been sent! {f.name} will be in touch
                        soon.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-gray-200 bg-white px-4 py-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1D9E75] text-white hover:bg-[#0F6E56] disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
