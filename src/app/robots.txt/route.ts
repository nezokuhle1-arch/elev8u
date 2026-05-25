export async function GET() {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /freelancer/dashboard
Disallow: /freelancer/leads
Disallow: /freelancer/calendar
Disallow: /freelancer/earnings
Disallow: /freelancer/profile
Disallow: /client/

Sitemap: https://elev8u.co.za/sitemap.xml`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
