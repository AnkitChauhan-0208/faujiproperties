import { Resend } from "resend";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "server-only";

type RelatedProperty = { title: string; location: string; city: string; slug: string } | { title: string; location: string; city: string; slug: string }[] | null;
type EnquiryNotificationRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  created_at: string;
  properties: RelatedProperty;
};

type NotificationSettings = { email: string; notification_enabled: boolean };
type NotificationDatabase = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }>;
    Views: Record<string, never>;
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function getProperty(property: RelatedProperty) {
  return Array.isArray(property) ? property[0] : property;
}

function siteUrl() {
  const value = process.env.SITE_URL?.trim();
  if (!value) throw new Error("SITE_URL is not configured.");
  return value.replace(/\/$/, "");
}

async function resetClaim(supabase: SupabaseClient<NotificationDatabase>, enquiryId: string) {
  const { error } = await supabase.from("enquiries").update({ notification_status: "pending", notification_claimed_at: null }).eq("id", enquiryId).eq("notification_status", "sending");
  if (error) console.error("Failed to reset enquiry notification claim:", error.message);
}

export async function notifyNewEnquiry(enquiryId: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    console.error("Enquiry notification skipped: Supabase server configuration is missing.");
    return;
  }

  const supabase = createClient<NotificationDatabase>(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: settings, error: settingsError } = await supabase.from("business_settings").select("email, notification_enabled").eq("id", "default").maybeSingle() as { data: NotificationSettings | null; error: { message: string } | null };

  if (settingsError) {
    console.error("Failed to load enquiry notification settings:", settingsError.message);
    return;
  }
  if (!settings?.notification_enabled) return;

  const recipient = process.env.RESEND_NOTIFICATION_EMAIL?.trim() || settings.email?.trim() || process.env.ADMIN_EMAIL?.trim();
  if (!apiKey || !from || !recipient) {
    console.error("Enquiry notification skipped: RESEND_API_KEY, RESEND_FROM_EMAIL, and an admin email are required.");
    return;
  }

  const { data: claimed, error: claimError } = await supabase.rpc("claim_enquiry_notification", { p_enquiry_id: enquiryId });
  if (claimError) {
    console.error("Failed to claim enquiry notification:", claimError.message);
    return;
  }
  if (claimed !== true) return;

  try {
    const { data: enquiry, error: enquiryError } = await supabase.from("enquiries").select("id, name, phone, email, message, created_at, properties(title, location, city, slug)").eq("id", enquiryId).single() as { data: EnquiryNotificationRow | null; error: { message: string } | null };
    if (enquiryError || !enquiry) throw new Error(enquiryError?.message || "Enquiry was not found after saving.");

    const property = getProperty(enquiry.properties);
    const baseUrl = siteUrl();
    const propertyUrl = property?.slug ? `${baseUrl}/properties/${encodeURIComponent(property.slug)}` : "";
    const adminUrl = `${baseUrl}/admin/enquiries`;
    const createdAt = new Date(enquiry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
    const propertyName = property?.title || "General enquiry";
    const propertyLocation = property ? `${property.location}, ${property.city}` : "Not specified";

    const resend = new Resend(apiKey);
    const { error: sendError } = await resend.emails.send({
      from,
      to: recipient,
      subject: `New property enquiry from ${enquiry.name}`,
      html: `<h1>New enquiry alert</h1><p>A visitor submitted a new enquiry.</p><dl><dt><strong>Customer name</strong></dt><dd>${escapeHtml(enquiry.name)}</dd><dt><strong>Customer phone</strong></dt><dd>${escapeHtml(enquiry.phone)}</dd><dt><strong>Customer email</strong></dt><dd>${enquiry.email ? escapeHtml(enquiry.email) : "Not provided"}</dd><dt><strong>Property</strong></dt><dd>${escapeHtml(propertyName)}</dd><dt><strong>Property location</strong></dt><dd>${escapeHtml(propertyLocation)}</dd><dt><strong>Message</strong></dt><dd>${escapeHtml(enquiry.message || "Not provided")}</dd><dt><strong>Date/time</strong></dt><dd>${escapeHtml(createdAt)}</dd></dl><p>${propertyUrl ? `<a href="${propertyUrl}">View property</a><br />` : ""}<a href="${adminUrl}">Open admin enquiries</a></p>`,
    });
    if (sendError) throw new Error(sendError.message);

    const { error: markSentError } = await supabase.from("enquiries").update({ notification_status: "sent", notification_sent_at: new Date().toISOString() }).eq("id", enquiryId).eq("notification_status", "sending");
    if (markSentError) console.error("Enquiry email sent but notification status could not be updated:", markSentError.message);
  } catch (error: unknown) {
    console.error("Failed to send enquiry notification:", error instanceof Error ? error.message : error);
    await resetClaim(supabase, enquiryId);
  }
}
