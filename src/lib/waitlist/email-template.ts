// Waitlist confirmation email. Built from design/v2/boards/WaitlistEmail.dc.html:
// table layout, inline styles, 600px wide, system fonts, no flex/grid/shadows
// so it renders in Gmail and Outlook.

export type WaitlistEmailInput = {
  position: number;
  joinedAt: Date;
  unsubscribeUrl: string;
  siteUrl: string;
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const PREHEADER = "We'll email you the moment V2 opens.";
const FOOTER_COPY = "© 2026 Elev8U. A Nexarc Technologies company.";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatJoinDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  });
}

export function buildWaitlistEmail(input: WaitlistEmailInput) {
  const position = Math.trunc(input.position);
  const joined = formatJoinDate(input.joinedAt);
  const subject = `You're #${position} on the Elev8U V2 waitlist`;
  const unsub = esc(input.unsubscribeUrl);
  const site = esc(input.siteUrl);
  const privacy = esc(`${input.siteUrl}/privacy`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#EDEEF2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EDEEF2;font-size:1px;line-height:1px;">${esc(PREHEADER)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EDEEF2" style="background-color:#EDEEF2;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;border:1px solid #E1E2E8;">
<tr><td bgcolor="#102B66" style="background-color:#102B66;padding:44px 40px;font-family:${FONT};font-size:24px;line-height:28px;font-weight:600;color:#FFFFFF;">Elev<span style="color:#7C9BF0;font-weight:700;">8</span>U</td></tr>
<tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:36px 40px 8px 40px;font-family:${FONT};">
<div style="font-size:12px;line-height:16px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#305CDE;padding-bottom:10px;">V2 waitlist</div>
<div style="font-size:32px;line-height:36px;font-weight:700;letter-spacing:-1px;color:#0A0A0A;padding-bottom:16px;">You're #${position} on the list.</div>
<p style="margin:0 0 14px 0;font-size:15px;line-height:25px;color:#3D3D3D;">Thanks for joining. We're building V2 of Elev8U, with a new dashboard and AI agents that draft your replies, flag what to fix on your profile and keep your numbers in order.</p>
<p style="margin:0 0 22px 0;font-size:15px;line-height:25px;color:#3D3D3D;">We'll email you the moment it opens. Until then there's nothing you need to do.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E8E8EC;">
<tr>
<td style="padding:16px 20px;font-family:${FONT};" align="left">
<div style="font-size:12px;line-height:16px;color:#6B6B6B;">Your spot</div>
<div style="font-size:26px;line-height:32px;font-weight:700;color:#0A0A0A;">#${position}</div>
</td>
<td style="padding:16px 20px;font-family:${FONT};" align="right">
<div style="font-size:12px;line-height:16px;color:#6B6B6B;">Joined</div>
<div style="font-size:14px;line-height:32px;font-weight:600;color:#0A0A0A;">${esc(joined)}</div>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 24px 0;">
<tr><td bgcolor="#0A0A0A" style="background-color:#0A0A0A;border-radius:26px;"><a href="${site}" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:14px;line-height:18px;font-weight:600;color:#FFFFFF;text-decoration:none;">Visit Elev8U</a></td></tr>
</table>
<p style="margin:0 0 28px 0;font-size:15px;line-height:25px;color:#3D3D3D;">The Elev8U team</p>
</td></tr>
<tr><td bgcolor="#F6F6F8" style="background-color:#F6F6F8;border-top:1px solid #ECECF0;padding:22px 40px 28px 40px;font-family:${FONT};font-size:12px;line-height:19px;color:#8A8A8A;">
<p style="margin:0 0 10px 0;">You're getting this because this email address was used to join the Elev8U V2 waitlist. We'll only email you about the V2 launch.</p>
<p style="margin:0;"><a href="${unsub}" style="color:#8A8A8A;text-decoration:underline;">Unsubscribe</a> &middot; <a href="${privacy}" style="color:#8A8A8A;text-decoration:underline;">Privacy Policy</a> &middot; ${esc(FOOTER_COPY)}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `You're #${position} on the list.`,
    "",
    "Thanks for joining. We're building V2 of Elev8U, with a new dashboard and AI agents that draft your replies, flag what to fix on your profile and keep your numbers in order.",
    "",
    "We'll email you the moment it opens. Until then there's nothing you need to do.",
    "",
    `Your spot: #${position}`,
    `Joined: ${joined}`,
    "",
    `Visit Elev8U: ${input.siteUrl}`,
    "",
    "The Elev8U team",
    "",
    "--",
    "You're getting this because this email address was used to join the Elev8U V2 waitlist. We'll only email you about the V2 launch.",
    `Unsubscribe: ${input.unsubscribeUrl}`,
    `Privacy Policy: ${input.siteUrl}/privacy`,
    FOOTER_COPY,
  ].join("\n");

  return { subject, html, text };
}
