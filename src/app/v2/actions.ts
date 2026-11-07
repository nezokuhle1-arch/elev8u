"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type JoinWaitlistState =
  | { status: "idle" }
  | { status: "invalid" }
  | { status: "already"; position: number }
  | { status: "error" }
  | { status: "success"; position: number }
  | { status: "closed" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO: wire up Resend — see design/v2/boards/WaitlistEmail.dc.html for the
// confirmation email layout/copy. Subject: "You're #N on the Elev8U V2
// waitlist", from hello@elev8u.co.za, include position + join date + an
// unsubscribe link.
async function sendWaitlistConfirmation(email: string, position: number) {
  void email;
  void position;
}

export async function joinWaitlistAction(
  _prevState: JoinWaitlistState,
  formData: FormData
): Promise<JoinWaitlistState> {
  // Honeypot: bots fill every field. If this hidden field has a value,
  // pretend success without touching the database.
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot !== "") {
    return { status: "success", position: 0 };
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
    console.error("[waitlist] join_waitlist failed:", error);
    return { status: "error" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error("[waitlist] join_waitlist returned no row for", email);
    return { status: "error" };
  }

  if (!row.already_existed) {
    try {
      await sendWaitlistConfirmation(email, row.position);
    } catch (err) {
      console.error("[waitlist] confirmation email failed:", err);
    }
  }

  return row.already_existed
    ? { status: "already", position: row.position }
    : { status: "success", position: row.position };
}

export async function resendConfirmationAction(
  email: string
): Promise<{ allowed: boolean }> {
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) {
    return { allowed: false };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("touch_resend", {
    p_email: trimmed,
  });

  if (error) {
    console.error("[waitlist] touch_resend failed:", error);
    return { allowed: false };
  }

  const allowed = Boolean(data);
  if (allowed) {
    try {
      // TODO: look up the row's position and re-send via Resend once installed.
    } catch (err) {
      console.error("[waitlist] resend failed:", err);
    }
  }

  return { allowed };
}
