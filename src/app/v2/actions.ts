"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWaitlistConfirmation } from "@/lib/waitlist/send";
import { getWaitlistSignup } from "@/lib/waitlist/signups";

export type JoinWaitlistState =
  | { status: "idle" }
  | { status: "invalid" }
  | { status: "already"; position: number }
  | { status: "error" }
  | { status: "success"; position: number; emailSent: boolean }
  | { status: "closed" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The signup row is already saved by the time this runs, so a failure here
// must never fail the signup: it only means emailSent = false.
async function sendInitialConfirmation(
  admin: SupabaseClient,
  email: string
): Promise<boolean> {
  try {
    const signup = await getWaitlistSignup(admin, email);
    if (!signup || signup.unsubscribedAt) return false;
    return await sendWaitlistConfirmation({
      email,
      signup,
      idempotencyKey: `waitlist-confirm/${signup.id}`,
    });
  } catch (err) {
    console.error("[waitlist] confirmation email failed", {
      reason: err instanceof Error ? err.name : "unknown",
    });
    return false;
  }
}

export async function joinWaitlistAction(
  _prevState: JoinWaitlistState,
  formData: FormData
): Promise<JoinWaitlistState> {
  // Honeypot: bots fill every field. If this hidden field has a value,
  // pretend success without touching the database.
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot !== "") {
    return { status: "success", position: 0, emailSent: false };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return { status: "invalid" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("join_waitlist", {
    p_email: email,
    p_consent_source: "waitlist_page",
  });

  if (error) {
    if (error.message?.includes("waitlist_closed")) {
      return { status: "closed" };
    }
    console.error("[waitlist] join_waitlist failed:", error.code ?? "unknown");
    return { status: "error" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error("[waitlist] join_waitlist returned no row");
    return { status: "error" };
  }

  if (row.already_existed) {
    return { status: "already", position: row.position };
  }

  const emailSent = await sendInitialConfirmation(admin, email);
  return { status: "success", position: row.position, emailSent };
}

export async function resendConfirmationAction(
  email: string
): Promise<{ allowed: boolean; emailSent: boolean }> {
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) {
    return { allowed: false, emailSent: false };
  }

  const admin = createAdminClient();

  let signup;
  try {
    signup = await getWaitlistSignup(admin, trimmed);
  } catch (err) {
    console.error("[waitlist] resend lookup failed", {
      reason: err instanceof Error ? err.name : "unknown",
    });
    return { allowed: false, emailSent: false };
  }

  // Never send to an unsubscribed (or unknown) address. Same response shape as
  // the rate limit so nothing about the address's state is revealed.
  if (!signup || signup.unsubscribedAt) {
    return { allowed: false, emailSent: false };
  }

  const { data, error } = await admin.rpc("touch_resend", {
    p_email: trimmed,
  });
  if (error) {
    console.error("[waitlist] touch_resend failed:", error.code ?? "unknown");
    return { allowed: false, emailSent: false };
  }
  if (!data) {
    return { allowed: false, emailSent: false };
  }

  // No idempotency key: it would collide with the initial send's key.
  const emailSent = await sendWaitlistConfirmation({ email: trimmed, signup });
  return { allowed: true, emailSent };
}
