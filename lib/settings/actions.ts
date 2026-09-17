"use server";

import { revalidatePath } from "next/cache";
import { createAuthorizedAdminClient } from "@/lib/supabase/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getValue(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

async function getAuthenticatedAdminClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isConfiguredAdmin = Boolean(adminEmail && user?.email?.toLowerCase() === adminEmail);

  if (error || !user || (!isConfiguredAdmin && user.app_metadata?.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  return supabase;
}

export async function updateBusinessSettingsAction(_previousState: { success: boolean; error?: string }, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const name = getValue(formData, "name");
    const phone = getValue(formData, "phone");
    const whatsapp = getValue(formData, "whatsapp");
    const email = getValue(formData, "email");
    const address = getValue(formData, "address");
    const mapsUrl = getValue(formData, "mapsUrl");
    const description = getValue(formData, "description");
    const notificationEnabled = formData.get("notificationEnabled") === "on";

    if (!name) {
      throw new Error("Business or brand name is required.");
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("Enter a valid business email address.");
    }

    if (mapsUrl) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(mapsUrl);
      } catch {
        throw new Error("Enter a valid Google Maps URL.");
      }
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Google Maps URL must start with http:// or https://.");
      }
    }

    const { error } = await supabase.from("business_settings").upsert({
      id: "default",
      name,
      phone,
      whatsapp,
      email,
      address,
      maps_url: mapsUrl,
      description,
      notification_enabled: notificationEnabled,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/properties");
    revalidatePath("/properties/[id]", "page");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to save business settings." };
  }
}

export async function changeAdminPasswordAction(_previousState: { success: boolean; error?: string }, formData: FormData) {
  try {
    const supabase = await getAuthenticatedAdminClient();
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (password !== confirmation) {
      throw new Error("Passwords do not match.");
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to change the password." };
  }
}

export async function changeAdminEmailAction(_previousState: { success: boolean; error?: string }, formData: FormData) {
  try {
    const supabase = await getAuthenticatedAdminClient();
    const email = getValue(formData, "email");
    const confirmation = getValue(formData, "emailConfirmation");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("Enter a valid admin email address.");
    }
    if (email.toLowerCase() !== confirmation.toLowerCase()) {
      throw new Error("Email addresses do not match.");
    }

    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to change the admin email." };
  }
}


