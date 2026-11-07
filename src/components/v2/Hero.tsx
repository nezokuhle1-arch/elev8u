"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Nav } from "./Nav";
import { Orb } from "./Orb";
import { WaitlistForm } from "./WaitlistForm";

const EASE_IN = "cubic-bezier(0.16, 1, 0.3, 1)";

export function Hero({
  waitlistOpen,
  nextPosition,
}: {
  waitlistOpen: boolean;
  nextPosition: number;
}) {
  const [navIn, setNavIn] = useState(false);
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setNavIn(true), 100);
    const t2 = setTimeout(() => setHeroIn(true), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const heroEnt = (delay: number): CSSProperties => ({
    opacity: heroIn ? 1 : 0,
    transform: `translateY(${heroIn ? 0 : 32}px)`,
    transition: `opacity 900ms ${EASE_IN} ${heroIn ? delay : 0}ms, transform 900ms ${EASE_IN} ${heroIn ? delay : 0}ms`,
  });

  return (
    <>
      <Nav navIn={navIn} />
      <section
        id="top"
        style={{
          position: "relative",
          width: "100%",
          // Column layout: the orb lives in the free space above the content,
          // so the mark can never collide with the headline at any viewport height.
          minHeight: "max(100vh, 880px)",
          paddingTop: 80, // clears the fixed nav (80px tall)
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          background: "radial-gradient(ellipse at 50% 30%, #102B66 0%, #0A1628 42%, #05070D 100%)",
        }}
      >
        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          <Orb heroIn={heroIn} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "68%",
            background: "linear-gradient(to top, rgba(5,7,13,0.92) 0%, rgba(5,7,13,0.55) 55%, rgba(5,7,13,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "0 24px 120px",
            maxWidth: 900,
            margin: "0 auto",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <h1
            style={{
              margin: "0 0 32px",
              fontSize: "clamp(40px, 8vw, 72px)",
              lineHeight: 0.95,
              letterSpacing: "-2.2px",
              fontWeight: 500,
              ...heroEnt(400),
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.55)" }}>The work is already here.</span>
            <br />
            <span style={{ color: "#fff", fontWeight: 600 }}>V2 makes it effortless.</span>
          </h1>
          <p
            style={{
              margin: "0 auto 48px",
              fontSize: 18,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 520,
              ...heroEnt(600),
            }}
          >
            Elev8U freelancers are already getting booked. V2 brings AI agents that draft your replies, grow your leads and handle the admin.
          </p>
          <div style={{ maxWidth: 520, margin: "0 auto", ...heroEnt(800) }}>
            {waitlistOpen ? (
              <WaitlistForm nextPosition={nextPosition} />
            ) : (
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: 24,
                  padding: "26px 30px",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#fff", marginBottom: 8 }}>
                  The waitlist is closed.
                </div>
                <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                  V2 is open to everyone now. Come and see what&rsquo;s new.
                </p>
                <a
                  href="https://elev8u.co.za"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fff",
                    color: "#0A0A0A",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "12px 22px",
                    borderRadius: 24,
                  }}
                >
                  Go to Elev8U
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
