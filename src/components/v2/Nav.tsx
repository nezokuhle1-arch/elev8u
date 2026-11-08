"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "@/app/v2/v2.module.css";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "What’s coming", href: "#coming" },
  { label: "First look", href: "#preview" },
  { label: "Why Elev8U", href: "#trust" },
  { label: "Current site", href: "https://elev8u.co.za" },
];

const EASE_OUT = "cubic-bezier(0.76, 0, 0.24, 1)";
const EASE_IN = "cubic-bezier(0.16, 1, 0.3, 1)";

export function Nav({ navIn }: { navIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navEnt = (delay: number): CSSProperties => ({
    opacity: navIn ? 1 : 0,
    transform: `translateY(${navIn ? 0 : -16}px)`,
    transition: `opacity 700ms ${EASE_IN} ${navIn ? delay : 0}ms, transform 700ms ${EASE_IN} ${navIn ? delay : 0}ms`,
  });

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 50,
          boxSizing: "border-box",
          transition: "background 500ms, backdrop-filter 500ms",
          background: scrolled ? "rgba(5,7,13,0.8)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : undefined,
          WebkitBackdropFilter: scrolled ? "blur(12px)" : undefined,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            height: 80,
            padding: "0 40px",
            maxWidth: 1440,
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <div>
            <a
              href="#top"
              style={{
                position: "relative",
                zIndex: 50,
                color: "#fff",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.5px",
                ...navEnt(0),
              }}
            >
              Elev<span style={{ color: "#7C9BF0", fontWeight: 700 }}>8</span>U
            </a>
          </div>
          <button
            type="button"
            className={styles.nv}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              justifySelf: "center",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "rgba(255,255,255,0.9)",
              fontSize: 14,
              padding: "8px 20px",
              borderRadius: 999,
              position: "relative",
              zIndex: 50,
              ...navEnt(200),
            }}
          >
            {open ? "Close" : "Navigate"}
          </button>
          <div
            className="hidden sm:flex"
            style={{ justifySelf: "end", ...navEnt(400) }}
          >
            <svg width="30" height="30" viewBox="0 0 120 60" fill="none" aria-hidden="true">
              <path
                d="M60 30 C48 12 14 12 14 30 C14 48 48 48 60 30 C72 12 106 12 106 30 C106 48 72 48 60 30 Z"
                stroke="#C7D6FF"
                strokeWidth="7"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex sm:hidden"
            style={{
              justifySelf: "end",
              width: 32,
              height: 32,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "transparent",
              border: 0,
              padding: 0,
              position: "relative",
              zIndex: 50,
              ...navEnt(200),
            }}
          >
            <span
              style={{
                display: "block",
                width: 24,
                height: 2,
                background: "#fff",
                transition: `transform 500ms ${EASE_OUT}`,
                transform: open ? "translateY(4px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: 24,
                height: 2,
                background: "#fff",
                transition: `transform 500ms ${EASE_OUT}`,
                transform: open ? "translateY(-4px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      <div
        className={styles.menuOverlay}
        style={{
          transition: `opacity 700ms ${EASE_OUT}, visibility 700ms ${EASE_OUT}`,
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
        }}
      >
        <div className={styles.menuList}>
        {LINKS.map((item, i) => (
          <a
            key={item.href}
            className={`${styles.ol} ${styles.menuLink}`}
            href={item.href}
            onClick={() => setOpen(false)}
            style={{
              opacity: open ? 1 : 0,
              transform: `translateY(${open ? 0 : 24}px)`,
              transition: `opacity 600ms ${EASE_OUT} ${open ? 150 + i * 80 : 0}ms, transform 600ms ${EASE_OUT} ${open ? 150 + i * 80 : 0}ms`,
            }}
          >
            {item.label}
          </a>
        ))}
        </div>
      </div>
    </>
  );
}
