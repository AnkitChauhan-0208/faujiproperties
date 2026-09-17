import { defaultBusinessSettings } from "@/data/company";
import { createAuthorizedAdminClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import "server-only";

export type BusinessSettings = typeof defaultBusinessSettings;
export type PublicBusinessSettings = BusinessSettings & {
  phoneHref: string;
  whatsappHref: string;
  mapsHref: string;
};

function withContactLinks(settings: BusinessSettings): PublicBusinessSettings {
  return {
    ...settings,
    phoneHref: settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, "")}` : "#",
    whatsappHref: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : "#",
    mapsHref: settings.mapsUrl || "#",
  };
}

function mapSettings(data: Record<string, unknown> | null): BusinessSettings {
  return {
    name: typeof data?.name === "string" ? data.name : defaultBusinessSettings.name,
    phone: typeof data?.phone === "string" ? data.phone : defaultBusinessSettings.phone,
    whatsapp: typeof data?.whatsapp === "string" ? data.whatsapp : defaultBusinessSettings.whatsapp,
    email: typeof data?.email === "string" ? data.email : defaultBusinessSettings.email,
    address: typeof data?.address === "string" ? data.address : defaultBusinessSettings.address,
    mapsUrl: typeof data?.maps_url === "string" ? data.maps_url : defaultBusinessSettings.mapsUrl,
    description: typeof data?.description === "string" ? data.description : defaultBusinessSettings.description,
    notificationEnabled: typeof data?.notification_enabled === "boolean" ? data.notification_enabled : defaultBusinessSettings.notificationEnabled,
  };
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = await createAuthorizedAdminClient();
  const { data, error } = await supabase.from("business_settings").select("name, phone, whatsapp, email, address, maps_url, description, notification_enabled").eq("id", "default").maybeSingle();

  if (error) {
    throw new Error(`Unable to load business settings: ${error.message}`);
  }

  if (!data) {
    return defaultBusinessSettings;
  }

  return mapSettings(data as Record<string, unknown>);
}

export async function getPublicBusinessSettings(): Promise<PublicBusinessSettings> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return withContactLinks(defaultBusinessSettings);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.from("business_settings").select("name, phone, whatsapp, email, address, maps_url, description").eq("id", "default").maybeSingle();

  if (error || !data) return withContactLinks(defaultBusinessSettings);
  return withContactLinks(mapSettings(data as Record<string, unknown>));
}