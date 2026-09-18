import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_MODE_COOKIE } from "./constants";

type SupabaseServerClientOptions = { sessionOnly?: boolean };

export async function createSupabaseServerClient(options: SupabaseServerClientOptions = {}) {
  const cookieStore = await cookies();
  const sessionOnly = options.sessionOnly ?? cookieStore.get(ADMIN_SESSION_MODE_COOKIE)?.value === "session";

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              const options = sessionOnly
                ? (() => {
                    const sessionOptions = { ...cookieOptions };
                    delete sessionOptions.maxAge;
                    delete sessionOptions.expires;
                    return sessionOptions;
                  })()
                : cookieOptions;
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot always mutate cookies; proxy refresh handles that case.
          }
        },
      },
    },
  );
}

export async function createAuthorizedAdminClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isConfiguredAdmin = Boolean(adminEmail && user?.email?.toLowerCase() === adminEmail);

  if (error || !user || (!isConfiguredAdmin && user.app_metadata?.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Supabase service role configuration is missing.");
  }

  return createClient(process.env.SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
