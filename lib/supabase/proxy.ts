import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_MODE_COOKIE } from "./constants";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isSecureRequest = request.nextUrl.protocol === "https:";
  const sessionOnly = request.cookies.get(ADMIN_SESSION_MODE_COOKIE)?.value === "session";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
            const options = sessionOnly
              ? (() => {
                  const sessionOptions = { ...cookieOptions };
                  delete sessionOptions.maxAge;
                  delete sessionOptions.expires;
                  return sessionOptions;
                })()
              : cookieOptions;
            response.cookies.set(name, value, { ...options, secure: isSecureRequest });
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isConfiguredAdmin = Boolean(adminEmail && user?.email?.toLowerCase() === adminEmail);
  const isAdmin = Boolean(user && (isConfiguredAdmin || user.app_metadata?.role === "admin"));
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!isLoginPage && !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  if (isLoginPage && isAdmin) {
    response = NextResponse.redirect(new URL("/admin", request.url));
  }

  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
