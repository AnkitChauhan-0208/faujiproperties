import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isConfiguredAdmin = Boolean(adminEmail && user?.email?.toLowerCase() === adminEmail);

  if (error || !user || (!isConfiguredAdmin && user.app_metadata?.role !== "admin")) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } });
  }

  return NextResponse.json({ authenticated: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
