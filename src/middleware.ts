import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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

  // Block hidden modules
  const hiddenPaths = ["/payments", "/services", "/employees", "/expenses", "/reminders", "/reports", "/settings"];
  const isHiddenRoute = hiddenPaths.some(p => request.nextUrl.pathname.startsWith(p));
  if (isHiddenRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Block hidden API routes
  const hiddenApiPaths = ["/api/payments", "/api/services", "/api/employees", "/api/expenses", "/api/reminders", "/api/reminder-rules", "/api/penalties", "/api/notification-queue", "/api/rentals", "/api/settings"];
  const isHiddenApi = hiddenApiPaths.some(p => request.nextUrl.pathname.startsWith(p));
  if (isHiddenApi) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isCronRoute = request.nextUrl.pathname.startsWith("/api/cron");

  // Allow cron routes with secret header
  if (isCronRoute) {
    const cronSecret = request.headers.get("x-cron-secret");
    if (cronSecret === process.env.CRON_SECRET) {
      return supabaseResponse;
    }
    // Also allow Authorization Bearer token for Vercel cron
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      return supabaseResponse;
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user && !isAuthRoute) {
    // API routes return 401 JSON instead of redirecting
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
