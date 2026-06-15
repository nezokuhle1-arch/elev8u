"use client";

import type { MatchedFreelancer } from "@/lib/concierge";
import { getInitials } from "@/lib/format";
import { ArrowRight, MapPin, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE =
  "Hi there! 👋 I'm Evolute AI. Tell me what professional service you're looking for and I'll find you the perfect match in South Africa.";

function formatPrice(f: MatchedFreelancer): string {
  if (f.priceMin != null && f.priceMax != null && f.priceMin !== f.priceMax) {
    return `R${f.priceMin} – R${f.priceMax}`;
  }
  if (f.priceMin != null) return `From R${f.priceMin}`;
  if (f.priceMax != null) return `Up to R${f.priceMax}`;
  return "Pricing on request";
}

export function EvoluteAIPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "initial", role: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [freelancers, setFreelancers] = useState<MatchedFreelancer[]>([]);
  const [showSignupOverlay, setShowSignupOverlay] = useState(false);
  const [overlayFreelancer, setOverlayFreelancer] =
    useState<MatchedFreelancer | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, freelancers, scrollToBottom]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const apiMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: trimmed },
    ];

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setFreelancers([]);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          userLocation: "",
          category: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      if (data.matchReady && data.freelancers?.length) {
        setFreelancers(data.freelancers);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content:
              data.reply ||
              "I found a great match for you! Take a look below.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply || "How can I help you today?",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleConnect(freelancer: MatchedFreelancer) {
    setOverlayFreelancer(freelancer);
    setShowSignupOverlay(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="glass-card relative overflow-hidden rounded-3xl shadow-2xl shadow-[#305CDE]/10">
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#305CDE] to-[#4B6EE8] px-6 py-4">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <div className="flex flex-1 items-center gap-1">
            <span className="font-semibold text-white">Evolute AI</span>
            <span className="text-xs text-white/60">Powered by Claude</span>
          </div>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
            elev8u
          </span>
        </div>

        <div className="relative min-h-[320px] max-h-[400px] overflow-y-auto bg-white/50 p-6 backdrop-blur-sm">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "ml-auto max-w-[80%] rounded-2xl rounded-tr-none bg-[#305CDE] px-4 py-3 text-sm text-white"
                      : "glass-card max-w-[80%] rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700 shadow-sm"
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-card flex gap-1 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                </div>
              </div>
            )}

            {freelancers.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#305CDE]">
                  ✨ I found your match!
                </p>
                {freelancers.map((f) => (
                  <div
                    key={f.id}
                    className="glass-card rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EEFB] text-sm font-medium text-[#305CDE]">
                        {getInitials(f.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {f.name}
                        </p>
                        <p className="text-xs text-gray-500">{f.category}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {f.location}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {f.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-[#305CDE]">
                          {formatPrice(f)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConnect(f)}
                      className="mt-3 w-full rounded-xl bg-[#305CDE] py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#1A3FA0]"
                    >
                      Connect with {f.name.split(" ")[0]}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-white flex items-center gap-3 border-t border-white/40 px-4 py-3"
        >
          <Sparkles className="h-5 w-5 shrink-0 text-[#305CDE]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Evolute AI anything... e.g. I need a web developer in Cape Town"
            className="flex-1 bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#305CDE] transition-all duration-200 hover:bg-[#1A3FA0] disabled:opacity-50"
            aria-label="Send message"
          >
            <ArrowRight className="h-4 w-4 text-white" />
          </button>
        </form>

        {showSignupOverlay && overlayFreelancer && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/80 p-8 text-center backdrop-blur-sm">
            <span className="text-4xl">🎉</span>
            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Your match is ready!
            </h3>
            <p className="mt-2 mb-6 max-w-sm text-sm text-gray-500">
              Create your free Elev8U account to connect with{" "}
              {overlayFreelancer.name} and get your project started.
            </p>
            <Link
              href="/signup"
              className="w-full max-w-xs rounded-xl bg-[#305CDE] py-3 font-semibold text-white transition-all duration-200 hover:bg-[#1A3FA0]"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="mt-3 text-sm text-[#305CDE] hover:underline"
            >
              Sign in instead
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              Free to join · No credit card required
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSignupOverlay(false);
                setOverlayFreelancer(null);
              }}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600"
            >
              Continue chatting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
