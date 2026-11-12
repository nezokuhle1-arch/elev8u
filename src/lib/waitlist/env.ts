import "server-only";

/** Raised for missing/invalid configuration. The message never contains a value. */
export class WaitlistConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WaitlistConfigError";
  }
}

function required(value: string | undefined, name: string): string {
  if (!value || value.trim() === "") {
    throw new WaitlistConfigError(`Missing required env var: ${name}`);
  }
  return value.trim();
}

/** Only the signing secret, so the unsubscribe route doesn't need the Resend vars. */
export function getUnsubscribeSecret(): string {
  return required(
    process.env.WAITLIST_UNSUBSCRIBE_SECRET,
    "WAITLIST_UNSUBSCRIBE_SECRET"
  );
}

/** Server-side only. Read at call time, never at import time. */
export function getWaitlistEnv() {
  return {
    resendApiKey: required(process.env.RESEND_API_KEY, "RESEND_API_KEY"),
    replyTo: required(process.env.WAITLIST_REPLY_TO, "WAITLIST_REPLY_TO"),
    unsubscribeSecret: getUnsubscribeSecret(),
  };
}

export const PRODUCTION_SITE_URL = "https://www.elev8u.co.za";

/**
 * Base URL for links inside emails. In production it must be exactly
 * https://www.elev8u.co.za — anything else (missing, localhost, http, another
 * host) throws so we never send broken links.
 */
export function getSiteUrl(): string {
  const raw = required(process.env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new WaitlistConfigError("NEXT_PUBLIC_SITE_URL is not a valid URL");
  }
  const origin = url.origin; // drops path, query and trailing slash

  if (process.env.NODE_ENV === "production") {
    if (origin !== PRODUCTION_SITE_URL) {
      throw new WaitlistConfigError(
        `NEXT_PUBLIC_SITE_URL must be ${PRODUCTION_SITE_URL} in production`
      );
    }
    return origin;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new WaitlistConfigError("NEXT_PUBLIC_SITE_URL must be http(s)");
  }
  return origin;
}
