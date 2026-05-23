import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/freelancer/dashboard",
  "/freelancer/profile/setup",
  "/client/home",
  "/client/concierge",
  "/client/bookings",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // #region agent log
  fetch("http://127.0.0.1:7540/ingest/93bcde73-d130-4d09-99cd-abc4ba828e24", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "dcc49e",
    },
    body: JSON.stringify({
      sessionId: "dcc49e",
      runId: "diagnose",
      hypothesisId: "H1-H3",
      location: "middleware.ts:request",
      message: "middleware request",
      data: {
        pathname,
        hasUser: !!user,
        isAdminRoute: pathname.startsWith("/admin"),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isBookingRoute = pathname.startsWith("/booking");
  const isAdminRoute = pathname.startsWith("/admin");

  if ((isProtected || isBookingRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // #region agent log
    fetch("http://127.0.0.1:7540/ingest/93bcde73-d130-4d09-99cd-abc4ba828e24", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "dcc49e",
      },
      body: JSON.stringify({
        sessionId: "dcc49e",
        runId: "diagnose",
        hypothesisId: "H4",
        location: "middleware.ts:admin",
        message: "admin route profile check",
        data: {
          role: profile?.role ?? null,
          profileError: profile === null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
