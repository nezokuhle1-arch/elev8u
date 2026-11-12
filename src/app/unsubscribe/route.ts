import { createAdminClient } from "@/lib/supabase/admin";
import { unsubscribeWaitlistSignup } from "@/lib/waitlist/signups";
import { isUuid, verifyUnsubscribeToken } from "@/lib/waitlist/unsubscribe-token";

// GET shows a confirm button; POST does the unsubscribe. Mail scanners and
// link prefetchers only ever GET, so they can't unsubscribe anyone. Mail
// clients' one-click unsubscribe (List-Unsubscribe-Post) sends the POST.

function page(status: number, title: string, body: string, form?: string) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;background:#EDEEF2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0A0A0A;">
<main style="max-width:480px;margin:12vh auto;padding:32px;background:#fff;border:1px solid #E1E2E8;border-radius:14px;">
<h1 style="margin:0 0 12px;font-size:22px;letter-spacing:-0.5px;">${title}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3D3D3D;">${body}</p>
${form ?? ""}
</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
}

const INVALID = () =>
  page(
    400,
    "This link isn't valid",
    "The unsubscribe link is incomplete or has been changed. Use the link from the most recent Elev8U email."
  );

function readParams(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id") ?? "";
  const token = params.get("t") ?? "";
  // verifyUnsubscribeToken reads the secret and throws if it is not configured.
  return isUuid(id) && verifyUnsubscribeToken(id, token) ? { id, token } : null;
}

export async function GET(request: Request) {
  let ok: { id: string; token: string } | null;
  try {
    ok = readParams(request);
  } catch (err) {
    console.error("[waitlist] unsubscribe config error", {
      reason: err instanceof Error ? err.message : "unknown",
    });
    return page(500, "Something went wrong", "Please try again later.");
  }
  if (!ok) return INVALID();

  const action = `/unsubscribe?${new URLSearchParams({ id: ok.id, t: ok.token }).toString()}`;
  return page(
    200,
    "Unsubscribe from the V2 waitlist?",
    "You'll stop getting emails about the Elev8U V2 launch.",
    `<form method="post" action="${action.replace(/&/g, "&amp;")}"><button type="submit" style="padding:12px 26px;border:0;border-radius:26px;background:#0A0A0A;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">Unsubscribe</button></form>`
  );
}

export async function POST(request: Request) {
  let ok: { id: string; token: string } | null;
  try {
    ok = readParams(request);
  } catch (err) {
    console.error("[waitlist] unsubscribe config error", {
      reason: err instanceof Error ? err.message : "unknown",
    });
    return page(500, "Something went wrong", "Please try again later.");
  }
  if (!ok) return INVALID();

  try {
    const found = await unsubscribeWaitlistSignup(createAdminClient(), ok.id);
    if (!found) return INVALID();
  } catch (err) {
    console.error("[waitlist] unsubscribe failed", {
      reason: err instanceof Error ? err.name : "unknown",
    });
    return page(500, "Something went wrong", "Please try again in a moment.");
  }

  return page(
    200,
    "You're unsubscribed",
    "You won't get any more emails about the Elev8U V2 waitlist."
  );
}
