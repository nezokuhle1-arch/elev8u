"use client";

import { useEffect, useReducer, useRef, useSyncExternalStore, type CSSProperties } from "react";
import styles from "@/app/v2/v2.module.css";

const AGENTS = [
  {
    label: "Response Agent",
    desc: "Drafts your first reply in seconds. You review, tap send.",
    without: "Leads go cold while you are on the job. By the time you reply, they have booked someone else.",
    withIt: "A reply is drafted the moment a lead lands. You review it, tap send, and stay first in line.",
    icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
    later: false,
  },
  {
    label: "Profile Optimiser",
    desc: "Tells you exactly what to fix: bio, pricing, portfolio gaps.",
    without: "A thin bio and missing prices quietly turn visitors away, and you never find out why.",
    withIt: "One clear list of what to fix: bio, pricing and portfolio gaps.",
    icon: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
    later: false,
  },
  {
    label: "Growth Agent",
    desc: "One priority action every week, based on your real numbers.",
    without: "You work hard, but never know the one thing to do next to get more bookings.",
    withIt: "One priority action every week, based on your real numbers.",
    icon: <path d="M5 20V10M12 20V4M19 20v-7" />,
    later: false,
  },
  {
    label: "Financial Analysis Agent",
    desc: "See your income, expenses and pricing health at a glance.",
    without: "Income and costs live in your head and a messy spreadsheet.",
    withIt: "Income, expenses and pricing health at a glance, so you charge what you are worth.",
    icon: (
      <>
        <path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V7z" />
        <path d="M4 7a2 2 0 0 1 2-2h10" />
        <circle cx="16" cy="13.5" r="1.2" />
      </>
    ),
    later: true,
  },
];

const REPLY =
  "Hi Sipho, yes I can start Monday. A 5-page site is R8,500 with a 3-week delivery. Want a quick call tomorrow?";
const DAY_T = [30, 46, 38, 62, 54, 72, 84];
const MON_T = [34, 44, 40, 56, 66, 80];

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const progOf = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getRM = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LABEL: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};
const SOFT: CSSProperties = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" };

function Bars({ targets, t, start, height, gap, labels }: { targets: number[]; t: number; start: number; height: number; gap: number; labels: string[] }) {
  return (
    <>
      <div style={{ display: "flex", gap, alignItems: "flex-end" }}>
        {targets.map((tg, i) => (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end", height }}>
            <div
              style={{
                width: "100%",
                borderRadius: "8px 8px 3px 3px",
                background: "linear-gradient(to top,#305CDE,#9DB4FF)",
                height: `${Math.round(tg * ease(progOf(t, start + i * 6, start + 44 + i * 6)))}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap, marginTop: 8, fontSize: 10.5, color: "rgba(255,255,255,0.45)" }}>
        {labels.map((l, i) => (
          <span key={i} style={{ flex: 1, textAlign: "center" }}>
            {l}
          </span>
        ))}
      </div>
    </>
  );
}

function Panel({ agent, t }: { agent: number; t: number }) {
  if (agent === 0) {
    const rc = Math.floor(progOf(t, 14, 104) * REPLY.length);
    const done = rc >= REPLY.length;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={LABEL}>New lead &middot; Sipho D. &middot; just now</div>
        <div
          className={styles.agBubble}
          style={{ ...SOFT, borderRadius: "18px 18px 18px 4px", padding: "16px 18px", fontSize: 14.5, lineHeight: 1.55, color: "#fff", boxSizing: "border-box" }}
        >
          Hi, I need a 5-page website for my accounting practice. Can you start next week?
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, ...LABEL, color: "#9DB4FF", marginTop: 6 }}>
          <span className={styles.pulseDot} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9DB4FF", boxShadow: "0 0 10px #9DB4FF" }} />
          Response Agent is drafting
        </div>
        <div
          className={styles.agReply}
          style={{ border: "1px solid rgba(157,180,255,0.5)", background: "rgba(48,92,222,0.16)", borderRadius: "18px 18px 4px 18px", padding: "16px 18px", fontSize: 14.5, lineHeight: 1.6, color: "#fff", boxSizing: "border-box" }}
        >
          {REPLY.slice(0, rc)}
          <span className={styles.caret} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <span style={{ border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 20px", borderRadius: 22 }}>Edit</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 22px",
              borderRadius: 22,
              transition: "all 300ms",
              ...(done
                ? { background: "#fff", color: "#0A0A0A", boxShadow: "0 0 24px rgba(157,180,255,0.7)" }
                : { background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.6)" }),
            }}
          >
            Send
          </span>
        </div>
      </div>
    );
  }

  if (agent === 1) {
    const pct = Math.round(58 + 34 * ease(progOf(t, 6, 110)));
    const items: [string, number][] = [
      ["Add a second portfolio piece", 40],
      ["Say who you help in your bio", 70],
      ["Price your ongoing care plan", 100],
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className={styles.agProfileTop} style={{ display: "flex" }}>
          <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
            <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
              <circle cx="75" cy="75" r="60" fill="none" stroke="#9DB4FF" strokeWidth="12" strokeLinecap="round" strokeDasharray="377" strokeDashoffset={(377 * (1 - pct / 100)).toFixed(1)} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-1px", color: "#fff", lineHeight: 1 }}>{pct}%</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Profile strength</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map(([text, at]) => {
              const on = t >= at;
              return (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box",
                      transition: "background 300ms, border-color 300ms",
                      ...(on ? { background: "#9DB4FF", border: "2px solid #9DB4FF" } : { background: "transparent", border: "2px solid rgba(255,255,255,0.3)" }),
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#05070D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transition: "opacity 300ms", opacity: on ? 1 : 0 }}>
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </span>
                  <span style={{ fontSize: 14, color: "#fff", lineHeight: 1.4 }}>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ ...SOFT, borderRadius: 16, padding: "16px 18px", transition: "opacity 500ms", opacity: t >= 24 ? 1 : 0 }}>
          <div style={{ ...LABEL, color: "#9DB4FF", marginBottom: 8 }}>Suggested bio</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "#fff" }}>
            Web designer in Cape Town building fast, bookable websites for accountants and IT firms.
          </div>
        </div>
      </div>
    );
  }

  if (agent === 2) {
    const g = ease(progOf(t, 10, 100));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...SOFT, borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ ...LABEL, color: "#9DB4FF", marginBottom: 10 }}>This week&rsquo;s priority</div>
          <div className={styles.agPriority} style={{ fontWeight: 600, letterSpacing: "-0.5px", color: "#fff", lineHeight: 1.25, marginBottom: 8 }}>
            Reply to new leads within 2 hours
          </div>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            Your fastest replies turn into bookings. This is the one move that matters most this week.
          </div>
        </div>
        <div style={{ ...SOFT, borderRadius: 16, padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            <span>Weekly goal &middot; 3 bookings</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{Math.min(3, Math.floor(progOf(t, 10, 100) * 3 + 0.2))} of 3</span>
          </div>
          <div style={{ height: 10, borderRadius: 10, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(to right,#305CDE,#9DB4FF)", width: `${(78 * g).toFixed(1)}%` }} />
          </div>
          <div style={{ marginTop: 20 }}>
            <Bars targets={DAY_T} t={t} start={8} height={90} gap={10} labels={["M", "T", "W", "T", "F", "S", "S"]} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ ...LABEL, marginBottom: 8 }}>Income this month</div>
          <div className={styles.agIncome} style={{ fontWeight: 700, letterSpacing: "-1.5px", color: "#fff", lineHeight: 1 }}>
            R{fmt(Math.round(18400 * ease(progOf(t, 6, 90))))}
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "5px 12px", whiteSpace: "nowrap" }}>
          Later in V2
        </span>
      </div>
      <div style={{ ...SOFT, borderRadius: 16, padding: "20px 22px" }}>
        <Bars targets={MON_T} t={t} start={6} height={130} gap={12} labels={["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#fff" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9DB4FF", boxShadow: "0 0 10px #9DB4FF" }} />
        Pricing health: <strong>Healthy</strong>
      </div>
    </div>
  );
}

const TICK_MS = 40;
const TICKS_PER_AGENT = 150;

type Rotation = { agent: number; t: number };
type RotationAction = { type: "tick" } | { type: "pick"; agent: number };

function rotationReducer(s: Rotation, a: RotationAction): Rotation {
  if (a.type === "pick") return { agent: a.agent, t: 0 };
  return s.t + 1 >= TICKS_PER_AGENT ? { agent: (s.agent + 1) % AGENTS.length, t: 0 } : { ...s, t: s.t + 1 };
}

export function AgentShowcase() {
  // One state object, one pure reducer: agent and tick can never drift apart,
  // and Strict Mode's double-invoked reducers produce the same result twice.
  const [{ agent, t: tick }, dispatch] = useReducer(rotationReducer, { agent: 0, t: 0 });
  const pausedRef = useRef(false);
  const reduced = useSyncExternalStore(subscribeRM, getRM, () => false);

  useEffect(() => {
    if (reduced) return;
    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const interval = setInterval(() => {
      if (pausedRef.current) return;
      dispatch({ type: "tick" });
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  const current = AGENTS[agent];
  // Reduced motion: show every panel in its finished state, no ticking.
  const t = reduced ? TICKS_PER_AGENT - 1 : tick;

  return (
    <section id="coming" className={styles.agSection} style={{ background: "#05070D", color: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "110px 40px 0", boxSizing: "border-box" }} className={styles.agWrap}>
        <div style={{ textAlign: "center", marginBottom: 56 }} className={styles.agHead}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9DB4FF" }}>
            Meet your AI team
          </span>
          <h2 className={styles.balance} style={{ margin: "12px 0 14px", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 500, letterSpacing: "-1.6px", lineHeight: 1.05 }}>
            <span style={{ color: "rgba(255,255,255,0.55)" }}>Your best work shouldn&rsquo;t wait on admin.</span>
            <br />
            <span style={{ fontWeight: 600 }}>Four agents that never clock out.</span>
          </h2>
          <p style={{ margin: "0 auto", maxWidth: 520, fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.65)" }}>
            Built into your dashboard. They handle the replies, the fixes, the planning and the numbers, so you can get back to the work.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start md:grid-cols-[0.9fr_1.1fr] md:gap-9">
          <div className={styles.agList}>
            {AGENTS.map((a, i) => (
              <button
                key={a.label}
                type="button"
                className={`${styles.agRow} ${agent === i ? "" : styles.agrow}`}
                onClick={() => {
                  dispatch({ type: "pick", agent: i });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  position: "relative",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  width: "100%",
                  fontFamily: "inherit",
                  color: "#fff",
                  cursor: "pointer",
                  borderRadius: 20,
                  transition: "background 300ms, border-color 300ms, opacity 300ms",
                  background: agent === i ? "rgba(255,255,255,0.1)" : "transparent",
                  border: agent === i ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.1)",
                  opacity: agent === i ? 1 : 0.62,
                  textAlign: "left",
                }}
              >
                <span className={styles.agRowInner} style={{ display: "flex", alignItems: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    {a.icon}
                  </svg>
                  <span>
                    <span className={styles.agTitle} style={{ display: "flex", alignItems: "center", fontWeight: 600, letterSpacing: "-0.2px" }}>
                      {a.label}
                      {a.later ? (
                        <span className={styles.agLater} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 20, padding: "2px 8px", marginLeft: 8, whiteSpace: "nowrap" }}>
                          Later in V2
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.agDesc} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                      {a.desc}
                    </span>
                  </span>
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    height: 2,
                    background: "#9DB4FF",
                    width: agent === i ? `${((t / TICKS_PER_AGENT) * 100).toFixed(1)}%` : "0%",
                  }}
                />
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "10%",
                right: "10%",
                bottom: "10%",
                background: "radial-gradient(ellipse, rgba(48,92,222,0.45) 0%, rgba(48,92,222,0) 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <div
              className={styles.agCard}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 28,
                boxSizing: "border-box",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 40px 80px -40px rgba(48,92,222,0.5), inset 0 1px 1px rgba(255,255,255,0.18)",
              }}
            >
              <Panel key={agent} agent={agent} t={t} />
            </div>

            <div className={`grid ${styles.agWW}`}>
              <div style={{ padding: "2px 4px" }}>
                <div style={{ ...LABEL, marginBottom: 8 }}>Without it</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{current.without}</p>
              </div>
              <div style={{ padding: "2px 4px" }}>
                <div style={{ ...LABEL, color: "#9DB4FF", marginBottom: 8 }}>With it</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#fff" }}>{current.withIt}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }} className={styles.agCtaWrap}>
          <a
            href="#top"
            className={styles.cta}
            style={{ display: "inline-block", background: "#fff", color: "#0A0A0A", fontSize: 14.5, fontWeight: 600, padding: "15px 34px", borderRadius: 30 }}
          >
            Be first in line
          </a>
        </div>
      </div>
    </section>
  );
}