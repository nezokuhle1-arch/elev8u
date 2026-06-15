"use client";

import { createClient } from "@/lib/supabase/client";
import {
  parseBudgetRange,
  type MatchData,
  type MatchedFreelancer,
} from "@/lib/concierge";
import { getInitials } from "@/lib/format";
import { Elev8ULogo } from "@/components/ui/Elev8ULogo";
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
  "Hi! 👋 I'm Evolute AI, your intelligent matching assistant. I'll help you find the perfect local professional in seconds. What do you need help with today?";

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ConciergeApiBody = {
  messages: { role: "user" | "assistant"; content: string }[];
  userLocation: string;
  category: string;
  freelancerId: string;
};

type ConciergeChatProps = {
  isGuestMode?: boolean;
};

export function ConciergeChat({ isGuestMode = false }: ConciergeChatProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [matchReady, setMatchReady] = useState(false);
  const [freelancers, setFreelancers] = useState<MatchedFreelancer[]>([]);
  const [enquirySent, setEnquirySent] = useState<Record<string, boolean>>({});
  const [enquiryLoading, setEnquiryLoading] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);
  const [signupOverlayFreelancerId, setSignupOverlayFreelancerId] = useState<
    string | null
  >(null);
  const [userLocation, setUserLocation] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<"loading" | null | { id: string }>(
    "loading"
  );

  const categoryParam = searchParams.get("category") ?? "";
  const messageParam = searchParams.get("message") ?? "";
  const freelancerIdParam = searchParams.get("freelancer_id") ?? "";
  const fromLanding = searchParams.get("guest") === "1";

  const showGuestButtons =
    authUser === "loading"
      ? fromLanding || isGuestMode
      : authUser === null;

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, freelancers, matchReady, scrollToBottom]);

  useEffect(() => {
    const supabase = createClient();

    async function syncAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthUser(user ? { id: user.id } : null);
    }

    void syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ? { id: session.user.id } : null);
    });

    return () => subscription.unsubscribe();
  }, [fromLanding, isGuestMode]);

  useEffect(() => {
    if (authUser === "loading" || authUser === null) return;

    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const redirectPath = `/client/concierge${window.location.search}`;

      if (!user) {
        router.replace(
          `/login?redirectTo=${encodeURIComponent(redirectPath)}`
        );
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("location, role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "freelancer") {
        showToast("Switch to a client account to use the concierge");
        router.replace("/freelancer/dashboard");
        return;
      }

      if (profile?.location) setUserLocation(profile.location);
    }
    loadProfile();
  }, [router, showToast, authUser]);

  const callConciergeApi = useCallback(
    async (apiMessages: { role: "user" | "assistant"; content: string }[], category: string) => {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          userLocation,
          category,
          freelancerId: freelancerIdParam,
        } satisfies ConciergeApiBody),
      });
      return { res, data: await res.json() };
    },
    [userLocation, freelancerIdParam]
  );

  const applyApiResponse = useCallback(
    (data: {
      message?: string;
      reply?: string;
      matchReady?: boolean;
      matchData?: MatchData;
      freelancers?: MatchedFreelancer[];
      error?: string;
    }) => {
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: String(data.error),
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const assistantMessage = data.message ?? data.reply ?? "";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantMessage,
          timestamp: new Date(),
        },
      ]);

      if (data.matchReady) {
        setMatchReady(true);
        if (data.matchData) setMatchData(data.matchData);
        setFreelancers(data.freelancers ?? []);
      }
    },
    [isGuestMode]
  );

  const sendToApi = useCallback(
    async (history: ChatMessage[], category: string) => {
      setIsLoading(true);
      const { res, data } = await callConciergeApi(
        history.map((m) => ({ role: m.role, content: m.content })),
        category
      );
      setIsLoading(false);

      if (!res.ok) {
        applyApiResponse({
          error: data.error ?? "Sorry, something went wrong. Please try again.",
        });
        return;
      }

      applyApiResponse(data);
    },
    [callConciergeApi, applyApiResponse]
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
      await sendToApi(history, category || categoryParam);
    },
    [isLoading, messages, sendToApi, categoryParam]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !fromLanding && !isGuestMode) return;

      if (messageParam) {
        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: messageParam,
          timestamp: new Date(),
        };
        setMessages([userMsg]);
        setIsLoading(true);
        const { res, data } = await callConciergeApi(
          [{ role: "user", content: messageParam }],
          categoryParam
        );
        setIsLoading(false);
        if (res.ok) applyApiResponse(data);
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
        const { res, data } = await callConciergeApi(
          [{ role: "user", content: text }],
          categoryParam
        );
        setIsLoading(false);
        if (res.ok) applyApiResponse(data);
        return;
      }

      if (freelancerIdParam) {
        const { data: fp } = await supabase
          .from("freelancer_profiles")
          .select(
            `
            id,
            category,
            location,
            profiles!freelancer_profiles_user_id_fkey(full_name)
          `
          )
          .eq("id", freelancerIdParam)
          .maybeSingle();

        if (!fp) {
          setMessages([
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content:
                "I couldn't find that professional's profile. Please try another link or search for a service.",
              timestamp: new Date(),
            },
          ]);
          return;
        }

        const profile = Array.isArray(fp.profiles) ? fp.profiles[0] : fp.profiles;
        const name = profile?.full_name ?? "this professional";
        const openingUser = `I'm interested in hiring ${name}, a ${fp.category} professional in ${fp.location}. I viewed their Elev8U profile and would like to send an enquiry.`;

        const userMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: openingUser,
          timestamp: new Date(),
        };

        setMessages([userMsg]);
        setIsLoading(true);

        const { res, data } = await callConciergeApi(
          [{ role: "user", content: openingUser }],
          fp.category
        );
        setIsLoading(false);

        if (res.ok) {
          applyApiResponse(data);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content:
                "Hi! I can help you send an enquiry. What specific work do you need done, what's your budget in Rands, and when do you need it?",
              timestamp: new Date(),
            },
          ]);
        }
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
  }, [
    messageParam,
    categoryParam,
    freelancerIdParam,
    callConciergeApi,
    applyApiResponse,
    isGuestMode,
    fromLanding,
  ]);

  function handleViewProfile(freelancerId: string) {
    setLoadingProfile(freelancerId);
    router.push(`/freelancer/${freelancerId}`);
  }

  async function handleSendEnquiry(freelancer: MatchedFreelancer) {
    if (!matchData) {
      showToast("Please complete the conversation before sending an enquiry.");
      return;
    }

    const targetFreelancerId = freelancerIdParam || freelancer.id;

    setEnquiryLoading(freelancer.id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEnquiryLoading(null);
      showToast("Please sign in as a client to send enquiries.");
      router.push(
        `/login?redirectTo=${encodeURIComponent(`/client/concierge?freelancer_id=${targetFreelancerId}`)}`
      );
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "client") {
      setEnquiryLoading(null);
      showToast("Switch to a client account to send enquiries");
      return;
    }

    const { budget_min, budget_max } = parseBudgetRange(matchData.budget);

    const leadPayload = {
      client_id: user.id,
      freelancer_id: targetFreelancerId,
      description: matchData.what,
      budget_min,
      budget_max,
      timeline: matchData.timeline,
      status: "pending" as const,
    };

    const { error } = await supabase.from("leads").insert(leadPayload);

    setEnquiryLoading(null);

    if (error) {
      console.error("[concierge] Lead insert failed:", error.message, error);
      showToast("Failed to send enquiry. Please try again.");
      return;
    }

    setEnquirySent((prev) => ({ ...prev, [freelancer.id]: true }));
    showToast(`Enquiry sent! ${freelancer.name} will be in touch soon.`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="flex h-dvh w-full max-w-[480px] flex-col bg-white shadow-sm">
      {toast && (
        <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <header className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#1A3FA0] to-[#305CDE] px-4 py-3 text-white">
        <Link
          href={showGuestButtons ? "/" : "/client/home"}
          className="rounded-full p-1 hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Elev8ULogo size="sm" theme="dark" href="/" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">Evolute AI</p>
          <p className="truncate text-xs text-white/70">Powered by Claude</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "rounded-2xl rounded-tr-none bg-[#305CDE] text-white"
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

          {matchReady && freelancers.length > 0 && matchData && (
            <div className="rounded-xl border border-[#305CDE]/30 bg-[#E8EEFB]/80 p-4">
              <h3 className="mb-3 font-semibold text-[#1A3FA0]">
                Matched professionals
              </h3>
              <div className="space-y-3">
                {freelancers.map((f) => (
                  <div
                    key={f.id}
                    className="relative rounded-xl border border-gray-100 bg-white p-3"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8EEFB] text-sm font-semibold text-[#305CDE]">
                        {getInitials(f.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900">{f.name}</p>
                        <p className="text-sm text-[#305CDE]">{f.category}</p>
                        <p className="text-xs text-gray-400">{f.location}</p>
                        <div className="mt-1 flex items-center gap-1 text-sm text-[#305CDE]">
                          <Star className="h-3.5 w-3.5 fill-[#305CDE] text-[#305CDE]" />
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

                    {showGuestButtons ? (
                      <button
                        type="button"
                        onClick={() => setSignupOverlayFreelancerId(f.id)}
                        className="mt-3 w-full rounded-xl bg-[#305CDE] py-2.5 text-sm font-medium text-white hover:bg-[#1A3FA0]"
                      >
                        Continue →
                      </button>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={loadingProfile === f.id}
                          onClick={() => handleViewProfile(f.id)}
                          className="flex flex-1 items-center justify-center rounded-lg border border-[#305CDE] py-2 text-sm font-medium text-[#305CDE] hover:bg-[#E8EEFB] disabled:opacity-60"
                        >
                          {loadingProfile === f.id ? (
                            <span className="flex items-center gap-2">
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#305CDE] border-t-transparent" />
                              Loading profile...
                            </span>
                          ) : (
                            "View profile"
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={
                            enquiryLoading === f.id || enquirySent[f.id]
                          }
                          onClick={() => handleSendEnquiry(f)}
                          className="flex-1 rounded-lg bg-[#305CDE] py-2 text-sm font-medium text-white hover:bg-[#1A3FA0] disabled:opacity-60"
                        >
                          {enquirySent[f.id]
                            ? "Enquiry sent ✓"
                            : enquiryLoading === f.id
                              ? "Sending…"
                              : "Send enquiry"}
                        </button>
                      </div>
                    )}

                    {showGuestButtons && signupOverlayFreelancerId === f.id && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#0A1628]/95 p-6 text-center backdrop-blur-sm">
                        <span className="mb-3 text-4xl">🎉</span>
                        <p className="mb-2 text-lg font-bold text-white">
                          Your match is ready!
                        </p>
                        <p className="mb-6 text-sm text-white/60">
                          Create your free Elev8U account to connect with{" "}
                          {f.name} and get started.
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push("/signup")}
                          className="w-full rounded-xl bg-[#305CDE] py-3 font-semibold text-white hover:bg-[#1A3FA0]"
                        >
                          Create free account →
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push("/login")}
                          className="mt-3 cursor-pointer text-sm text-[#6B8EE8]"
                        >
                          Sign in instead
                        </button>
                        <p className="mt-4 text-xs text-white/25">
                          Free to join · No credit card required
                        </p>
                        <button
                          type="button"
                          onClick={() => setSignupOverlayFreelancerId(null)}
                          className="mt-3 text-xs text-white/40 hover:text-white/60"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchReady && freelancers.length === 0 && (
            <div className="rounded-xl border border-[#305CDE]/30 bg-[#E8EEFB]/80 p-4 text-center">
              <p className="text-sm text-zinc-700">
                No freelancers found in your area yet. Be the first to sign up!
              </p>
              <Link
                href="/signup"
                className="mt-3 inline-block rounded-lg bg-[#305CDE] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A3FA0]"
              >
                Join as Freelancer
              </Link>
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
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#305CDE] focus:ring-2 focus:ring-[#305CDE]/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#305CDE] text-white hover:bg-[#1A3FA0] disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}
