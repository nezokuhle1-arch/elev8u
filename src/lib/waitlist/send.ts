import "server-only";
import { Resend } from "resend";
import { buildWaitlistEmail } from "./email-template";
import { getSiteUrl, getWaitlistEnv, WaitlistConfigError } from "./env";
import type { WaitlistSignup } from "./signups";
import { buildUnsubscribeUrl } from "./unsubscribe-token";

const FROM = "Elev8U <hello@elev8u.co.za>";
export const SEND_TIMEOUT_MS = 5000;

class SendTimeoutError extends Error {
  constructor() {
    super("timeout");
    this.name = "timeout";
  }
}

/**
 * Sends the waitlist confirmation email. Never throws and never logs the
 * address, the key or provider message text: returns true only when Resend
 * accepted the email within SEND_TIMEOUT_MS.
 *
 * Pass `idempotencyKey` only for the initial send. A resend must not reuse it
 * (Resend would dedupe it for 24h and silently send nothing).
 */
export async function sendWaitlistConfirmation(args: {
  email: string;
  signup: Pick<WaitlistSignup, "id" | "position" | "createdAt">;
  idempotencyKey?: string;
}): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const env = getWaitlistEnv();
    const siteUrl = getSiteUrl();
    const unsubscribeUrl = buildUnsubscribeUrl(siteUrl, args.signup.id);
    const { subject, html, text } = buildWaitlistEmail({
      position: args.signup.position,
      joinedAt: new Date(args.signup.createdAt),
      unsubscribeUrl,
      siteUrl,
    });

    const resend = new Resend(env.resendApiKey);
    const request = resend.emails.send(
      {
        from: FROM,
        to: args.email,
        replyTo: env.replyTo,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: [{ name: "type", value: "waitlist_confirmation" }],
      },
      args.idempotencyKey ? { idempotencyKey: args.idempotencyKey } : undefined
    );
    request.catch(() => {}); // avoid an unhandled rejection if the timeout wins
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new SendTimeoutError()), SEND_TIMEOUT_MS);
    });

    const result = await Promise.race([request, timeout]);
    if (result.error) {
      console.error("[waitlist] confirmation email failed", {
        reason: result.error.name,
        statusCode: result.error.statusCode,
      });
      return false;
    }
    return true;
  } catch (err) {
    // Only our own config/timeout errors carry safe text; log the name for the rest.
    console.error("[waitlist] confirmation email failed", {
      reason: err instanceof Error ? err.name : "unknown",
      detail: err instanceof WaitlistConfigError ? err.message : undefined,
    });
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
