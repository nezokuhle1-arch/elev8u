"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "@/app/v2/v2.module.css";

const ACCENT = "#305CDE";
const DASH_REPLY =
  "Hi Sipho, yes I can start Monday. A 5-page site is R8,500 with a 3-week delivery. Want a quick call tomorrow?";
const STAR = "M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z";

const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getRM = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Ico({ children, stroke = "#3A3A3E" }: { children: ReactNode; stroke?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

function SidebarItem({ icon, label, badge, active }: { icon: ReactNode; label: string; badge?: number; active?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "9px 12px",
        borderRadius: 12,
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        background: active ? "rgba(48,92,222,0.1)" : "transparent",
        color: active ? ACCENT : "#3A3A3E",
      }}
    >
      {icon}
      <span>{label}</span>
      {badge ? (
        <span style={{ marginLeft: "auto", background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 700, width: 19, height: 19, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function StatTile({ label, value, sub, accent, subAccent }: { label: string; value: string; sub: string; accent?: boolean; subAccent?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        background: accent ? `linear-gradient(135deg, ${ACCENT} 0%, #1A3FA0 100%)` : "#fff",
        border: accent ? undefined : "1px solid rgba(10,10,10,0.05)",
        boxShadow: accent ? "0 18px 34px -18px rgba(26,63,160,0.6)" : "0 14px 30px -20px rgba(10,10,10,0.2)",
        borderRadius: 20,
        padding: "15px 17px",
      }}
    >
      <div style={{ fontSize: 11.5, color: accent ? "rgba(255,255,255,0.8)" : "#6B6B6B" }}>{label}</div>
      <span style={{ position: "absolute", top: 11, right: 12, width: 24, height: 24, borderRadius: "50%", background: accent ? "rgba(255,255,255,0.2)" : "#F1F1F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent ? "#fff" : "#3A3A3E"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17L17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </span>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px", color: accent ? "#fff" : "#0A0A0A", marginTop: 14, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.85)" : subAccent ? ACCENT : "#6B6B6B", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Lead({ name, badge, badgeNew, ago, text, chips, actions }: { name: string; badge: string; badgeNew?: boolean; ago: string; text: string; chips: [string, boolean][]; actions?: boolean }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(10,10,10,0.05)", borderRadius: 16, padding: "15px 17px", boxShadow: "0 14px 30px -22px rgba(10,10,10,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
        <span style={{ marginLeft: "auto", background: badgeNew ? "rgba(48,92,222,0.1)" : "#F1F1F3", color: badgeNew ? ACCENT : "#3A3A3E", fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 12 }}>{badge}</span>
        <span style={{ fontSize: 10.5, color: "#6B6B6B" }}>{ago}</span>
      </div>
      <div style={{ fontSize: 12, color: "#3A3A3E", lineHeight: 1.5, marginTop: 6 }}>{text}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
        {chips.map(([c, hl]) => (
          <span key={c} style={{ background: hl ? "rgba(48,92,222,0.08)" : "#F1F1F3", color: hl ? ACCENT : "#3A3A3E", fontSize: 10.5, fontWeight: hl ? 600 : 500, padding: "3px 10px", borderRadius: 20 }}>
            {c}
          </span>
        ))}
      </div>
      {actions ? (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <span style={{ flex: 1, textAlign: "center", background: ACCENT, color: "#fff", fontSize: 12, fontWeight: 600, padding: 9, borderRadius: 9 }}>Accept</span>
          <span style={{ border: "1px solid rgba(10,10,10,0.1)", color: "#3A3A3E", fontSize: 12, fontWeight: 500, padding: "9px 18px", borderRadius: 9 }}>Decline</span>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [dc, setDc] = useState(0);
  const reduced = useSyncExternalStore(subscribeRM, getRM, () => false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduced) return;
    const interval = setInterval(() => setDc((n) => Math.min(400, n + 1)), 40);
    return () => clearInterval(interval);
  }, [visible, reduced]);

  const typed = reduced ? DASH_REPLY.length : Math.floor(Math.max(0, dc - 8) * 1.2);

  return (
    <section id="preview" style={{ position: "relative", background: "#05070D", color: "#fff", overflow: "hidden" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px 54px", textAlign: "center", boxSizing: "border-box", position: "relative", zIndex: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9DB4FF" }}>
          A first look &middot; sample data
        </span>
        <h2 className={styles.balance} style={{ margin: "12px 0 14px", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 500, letterSpacing: "-1.6px", lineHeight: 1.05 }}>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>Every lead, booking and reply.</span>
          <br />
          <span style={{ fontWeight: 600 }}>One calm dashboard.</span>
        </h2>
        <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.65)" }}>
          A first look at the V2 dashboard. There&rsquo;s a lot more inside.
        </p>
      </div>

      <div className={styles.pvStage}>
        <div className={styles.pvArc} />
        <svg className={`${styles.star} ${styles.pvS1}`} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ animationDelay: "0.4s" }}>
          <path d={STAR} fill="#C7D6FF" />
        </svg>
        <svg className={`${styles.star} ${styles.pvS2}`} width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" style={{ animationDelay: "1.6s" }}>
          <path d={STAR} fill="#fff" />
        </svg>
        <svg className={`${styles.star} ${styles.pvS3}`} width="10" height="10" viewBox="0 0 24 24" aria-hidden="true" style={{ animationDelay: "2.4s" }}>
          <path d={STAR} fill="#9DB4FF" />
        </svg>

        <div ref={ref} className={`${styles.dashRise} ${visible ? styles.dashRiseIn : ""} ${styles.pvRise}`}>
          <div id="dash-peek" className={styles.pvFrame}>
            <div className={styles.pvScreen}>
              <div className={styles.pvSide}>
                <div style={{ fontSize: 19, letterSpacing: "-0.5px", padding: "0 12px 20px" }}>
                  <span style={{ fontWeight: 500 }}>Elev</span>
                  <span style={{ color: ACCENT, fontWeight: 700 }}>8</span>
                  <span style={{ fontWeight: 500 }}>U</span>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", color: "#9A9A9E", padding: "0 12px 6px" }}>OVERVIEW</div>
                <SidebarItem active label="Dashboard" icon={<Ico stroke={ACCENT}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Ico>} />
                <SidebarItem label="Leads" badge={3} icon={<Ico><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Ico>} />
                <SidebarItem label="Bookings" icon={<Ico><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Ico>} />
                <SidebarItem label="Reviews" icon={<Ico><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></Ico>} />
                <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", color: "#9A9A9E", padding: "16px 12px 6px" }}>GROW</div>
                <SidebarItem label="Growth Agent" icon={<Ico><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></Ico>} />
                <SidebarItem label="Profile Optimiser" icon={<Ico><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></Ico>} />
                <SidebarItem label="Earnings" icon={<Ico><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 11h18" /></Ico>} />
              </div>

              <div className={styles.pvMain}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
                  <div>
                    <div className={styles.pvTitle} style={{ fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                      Hey, Thandi &mdash; here&rsquo;s your week at a glance
                    </div>
                    <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 5 }}>Web designer &middot; Cape Town</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                    <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", boxShadow: "0 4px 12px -4px rgba(10,10,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3A3A3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
                        <path d="M10 20a2 2 0 0 0 4 0" />
                      </svg>
                    </span>
                    <span style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, color: "#fff", fontSize: 11.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>TM</span>
                  </div>
                </div>

                <div className={styles.pvStats}>
                  <StatTile accent label="New leads" value="3" sub="+2 this week" />
                  <StatTile label="Bookings" value="2" sub="1 upcoming" />
                  <StatTile accent label="Rating" value="4.9" sub="47 reviews" />
                  <StatTile label="Profile views" value="128" sub="↑ 18% this week" subAccent />
                </div>

                <div className={styles.pvCols}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>New leads</span>
                      <span style={{ fontSize: 11.5, fontWeight: 500, color: ACCENT }}>View all &rsaquo;</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <Lead name="Sipho Dlamini" badge="New" badgeNew ago="2m ago" text="Need a 5-page website for my accounting practice. Hoping to start next week." chips={[["R8,000–R10,000", true], ["Next week", false]]} actions />
                      <Lead name="Naledi Peters" badge="Reviewing" ago="1h ago" text="Care plan and a refresh for our café site, mainly hosting and updates." chips={[["R650/month", true], ["This week", false]]} />
                    </div>
                  </div>

                  <div className={styles.pvAgentCol}>
                    <div style={{ background: "#fff", border: "1px solid rgba(10,10,10,0.05)", borderRadius: 20, padding: 18, boxShadow: "0 18px 40px -26px rgba(10,10,10,0.25)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(48,92,222,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                          </svg>
                        </span>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Response Agent</div>
                          <div style={{ fontSize: 10.5, color: "#6B6B6B" }}>Drafted for Sipho&rsquo;s lead</div>
                        </div>
                      </div>
                      <div className={styles.pvAgentText} style={{ background: "#F5F6F8", borderRadius: 12, padding: "12px 13px", fontSize: 11.5, lineHeight: 1.6, color: "#3A3A3E", boxSizing: "border-box" }}>
                        &ldquo;{DASH_REPLY.slice(0, typed)}
                        <span className={styles.caretA} />
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 11, flexWrap: "wrap" }}>
                        {["Rephrase", "Shorten", "Add price"].map((c) => (
                          <span key={c} style={{ border: "1px solid rgba(10,10,10,0.1)", fontSize: 10.5, padding: "5px 11px", borderRadius: 16, color: "#3A3A3E" }}>{c}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
                        <div style={{ flex: 1, border: "1px solid rgba(10,10,10,0.1)", borderRadius: 12, padding: "10px 12px", fontSize: 11, color: "#9A9A9A" }}>Ask AI to adjust the reply&hellip;</div>
                        <span style={{ width: 32, height: 32, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                            <path d="M7.5 12V3M7.5 3L3.5 7M7.5 3L11.5 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.pvFade} />
        <div className={styles.pvPill}>
          More inside
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
