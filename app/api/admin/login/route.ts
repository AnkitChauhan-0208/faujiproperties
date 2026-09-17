import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_MODE_COOKIE } from "@/lib/supabase/constants";

export async function POST(request: Request) {
  const isSecureRequest = new URL(request.url).protocol === "https:";
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const rememberMe = body?.rememberMe === true;

  if (!email || !password) return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
        const options = rememberMe ? cookieOptions : (() => {
          const sessionOptions = { ...cookieOptions };
          delete sessionOptions.maxAge;
          delete sessionOptions.expires;
          return sessionOptions;
        })();
        response.cookies.set(name, value, { ...options, secure: isSecureRequest });
      }),
    },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isConfiguredAdmin = Boolean(adminEmail && data.user?.email?.toLowerCase() === adminEmail);
  const isRoleAdmin = data.user?.app_metadata?.role === "admin";

  if (error || !data.user || (!isConfiguredAdmin && !isRoleAdmin)) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  response.cookies.set(ADMIN_SESSION_MODE_COOKIE, rememberMe ? "persistent" : "session", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest,
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
  return response;
}
