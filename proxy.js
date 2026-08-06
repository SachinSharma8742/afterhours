import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  let user = null;
  const path = request.nextUrl.pathname;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder")) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    }
  } catch (err) {
    console.warn("Middleware auth check warning:", err);
  }

  const hasLocalAuth = request.cookies.get("afterhours_auth")?.value === "true";
  const isAuthenticated = !!user || hasLocalAuth;

  // 1. Protected Customer User Routes
  if ((path.startsWith("/dashboard") || path.startsWith("/checkout")) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // 2. Intercept legacy public /organizer & /admin paths -> redirect to /403
  if (path.startsWith("/organizer") || path.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.rewrite(url);
  }

  // 3. Protected Obscure Internal Operations Routes (/portal-ops-x97)
  if (path.startsWith("/portal-ops-x97") && !path.startsWith("/portal-ops-x97/login")) {
    const hasAdminAuth = request.cookies.get("afterhours_admin_auth")?.value === "true";
    const userRole = user?.user_metadata?.role;
    const isAuthorizedRole = user && ["admin", "staff"].includes(userRole);

    if (!hasAdminAuth && !isAuthorizedRole) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal-ops-x97/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/portal-ops-x97/:path*",
    "/organizer/:path*",
    "/checkout/:path*",
  ],
};
