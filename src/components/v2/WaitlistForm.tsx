"use client";

import { useActionState, useState, useTransition } from "react";
import styles from "@/app/v2/v2.module.css";
import {
  joinWaitlistAction,
  resendConfirmationAction,
  type JoinWaitlistState,
} from "@/app/v2/actions";

export function WaitlistForm({ nextPosition }: { nextPosition: number }) {
  const [state, formAction, isPending] = useActionState<JoinWaitlistState, FormData>(
    joinWaitlistAction,
    { status: "idle" }
  );
  const [focused, setFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [resendPending, startResend] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  if (state.status === "success" || state.status === "already") {
    const position = state.position;
    return (
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
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid #C7D6FF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C7D6FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </span>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#fff", marginBottom: 8 }}>
          {state.status === "already" ? (
            <>
              You&rsquo;re already on the list.
            </>
          ) : (
            <>You&rsquo;re #{position} on the list.</>
          )}
        </div>
        {state.status === "already" ? (
          <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            You&rsquo;re <strong style={{ color: "#fff" }}>#{position}</strong>. We&rsquo;ve kept your spot, so there&rsquo;s nothing more to do.
          </p>
        ) : null}
        {resendMessage ? (
          <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>{resendMessage}</p>
        ) : null}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {state.status === "already" ? (
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                if (resendPending) return;
                startResend(async () => {
                  const result = await resendConfirmationAction(email);
                  setResendMessage(
                    result.allowed
                      ? "Confirmation email on its way."
                      : "You already asked recently — try again in a few minutes."
                  );
                });
              }}
              style={{ fontSize: 12.5, fontWeight: 600, color: "#C7D6FF" }}
            >
              {resendPending ? "Sending…" : "Resend my confirmation email"}
            </a>
          ) : null}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            style={{ fontSize: 12.5, fontWeight: 600, color: "#C7D6FF" }}
          >
            Use a different email
          </a>
        </div>
      </div>
    );
  }

  const isInvalid = state.status === "invalid";
  const isError = state.status === "error";
  const hasAlertBorder = isInvalid || isError;

  return (
    <div>
      <form action={formAction} aria-busy={isPending}>
        {/* Honeypot — real users never see or fill this. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, left: -9999 }}
        />
        <div
          className={styles.pill}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.08)",
            border: `1px solid ${hasAlertBorder ? "#FF9E94" : "rgba(255,255,255,0.22)"}`,
            borderRadius: 30,
            padding: "7px 7px 7px 22px",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: focused && !hasAlertBorder ? "0 0 0 2px rgba(255,255,255,0.7)" : undefined,
          }}
        >
          <label htmlFor="wl-email" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Email address
          </label>
          <input
            id="wl-email"
            name="email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            readOnly={isPending}
            required
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              fontSize: 14.5,
              color: isPending ? "rgba(255,255,255,0.6)" : "#fff",
              background: "transparent",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            className={styles.cta}
            disabled={isPending}
            aria-label="Join the waitlist"
            style={{
              flexShrink: 0,
              height: 46,
              padding: "0 24px",
              borderRadius: 26,
              border: "none",
              background: isPending ? "rgba(255,255,255,0.72)" : "#fff",
              color: "#0A0A0A",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {isPending ? (
              <>
                <svg className={styles.spin} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="#0A0A0A" strokeWidth="2.4" strokeOpacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="#0A0A0A" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                Joining&hellip;
              </>
            ) : (
              <>
                Join the waitlist
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {isInvalid ? (
        <p role="alert" style={{ margin: "10px 0 0", fontSize: 12.5, color: "#FF9E94", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9E94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          That doesn&rsquo;t look like an email address. Try something like name@example.com.
        </p>
      ) : null}

      {isError ? (
        <div style={{ marginTop: 10 }}>
          <p role="alert" style={{ margin: 0, fontSize: 12.5, color: "#FF9E94", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9E94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            Something went wrong on our side and your email wasn&rsquo;t saved. Please try again.
          </p>
        </div>
      ) : null}

      {!hasAlertBorder ? (
        <p style={{ margin: "20px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
          You&rsquo;ll be <strong style={{ color: "#fff" }}>#{nextPosition}</strong> on the list.
        </p>
      ) : null}
      <p style={{ margin: "16px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
        By joining you agree to get launch emails from Elev8U. See our{" "}
        <a href="/privacy" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}>
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
