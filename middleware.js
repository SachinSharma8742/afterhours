import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

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

  const { data: { user } } = await supabase.auth.getUser();
  const hasLocalAuth = request.cookies.get("afterhours_auth")?.value === "true";
  const isAuthenticated = !!user || hasLocalAuth;
  const path = request.nextUrl.pathname;

  // 1. Protected Customer User Routes
  if ((path.startsWith("/dashboard") || path.startsWith("/checkout")) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // 2. Intercept legacy public /organizer paths -> redirect to /403
  if (path.startsWith("/organizer")) {
    const url = request.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.rewrite(url);
  }

  // 3. Protected Internal Admin System Routes (/admin)
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const hasAdminAuth = request.cookies.get("afterhours_admin_auth")?.value === "true";
    const isAdminUser = user && ["admin", "staff", "scanner", "organizer"].includes(user.user_metadata?.role);

    if (!hasAdminAuth && !isAdminUser) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
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
    "/organizer/:path*",
    "/checkout/:path*",
  ],
};
