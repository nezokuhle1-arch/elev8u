import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getUnsubscribeSecret } from "./env";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function mac(id: string): Buffer {
  return createHmac("sha256", getUnsubscribeSecret())
    .update(`waitlist-unsubscribe:${id.toLowerCase()}`)
    .digest();
}

/** HMAC-SHA256 over the signup id, base64url. Cannot be guessed without the secret. */
export function signUnsubscribeToken(id: string): string {
  return mac(id).toString("base64url");
}

export function verifyUnsubscribeToken(id: string, token: string): boolean {
  if (!isUuid(id) || !token) return false;
  const expected = Buffer.from(mac(id).toString("base64url"));
  const given = Buffer.from(token);
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export function buildUnsubscribeUrl(siteUrl: string, id: string): string {
  const params = new URLSearchParams({ id, t: signUnsubscribeToken(id) });
  return `${siteUrl}/unsubscribe?${params.toString()}`;
}
