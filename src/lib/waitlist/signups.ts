import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type WaitlistSignup = {
  id: string;
  position: number;
  createdAt: string;
  unsubscribedAt: string | null;
};

/** Looks a signup up by email via the service-role-only RPC. Null if not found. */
export async function getWaitlistSignup(
  admin: SupabaseClient,
  email: string
): Promise<WaitlistSignup | null> {
  const { data, error } = await admin.rpc("get_waitlist_signup", {
    p_email: email,
  });
  if (error) {
    throw new Error(`get_waitlist_signup failed: ${error.code ?? "unknown"}`);
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    id: row.id,
    position: row.position,
    createdAt: row.created_at,
    unsubscribedAt: row.unsubscribed_at ?? null,
  };
}

/** Server-only: sets unsubscribed_at. Returns false if no such signup. */
export async function unsubscribeWaitlistSignup(
  admin: SupabaseClient,
  id: string
): Promise<boolean> {
  const { data, error } = await admin.rpc("unsubscribe_waitlist", { p_id: id });
  if (error) {
    throw new Error(`unsubscribe_waitlist failed: ${error.code ?? "unknown"}`);
  }
  return Boolean(data);
}
