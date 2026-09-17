"use server";

import { revalidatePath } from "next/cache";
import { createAuthorizedAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";
import { notifyNewEnquiry } from "./notifications";

const statuses = ["New", "Contacted", "Interested", "Closed"] as const;
type EnquiryStatus = typeof statuses[number];

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String(error.message);
  return "Unable to save enquiry.";
}

async function verifyAdmin() {
  return createAuthorizedAdminClient();
}

export async function createEnquiryAction(formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();
    const propertyId = String(formData.get("propertyId") || "");
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    if (!name || !phone || !message) throw new Error("Name, phone, and message are required.");
    if (!/^\d{10}$/.test(phone)) throw new Error("Please enter a valid 10-digit mobile number.");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email address.");
    const enquiryId = randomUUID();
    const { error } = await supabase.from("enquiries").insert({ id: enquiryId, property_id: propertyId || null, name, phone, email: email || null, message });
    if (error) throw error;
    await notifyNewEnquiry(enquiryId);
    revalidatePath("/admin/enquiries");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create enquiry:", errorMessage(error));
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateEnquiryStatusAction(id: string, status: EnquiryStatus) {
  try {
    if (!statuses.includes(status)) throw new Error("Invalid enquiry status.");
    const supabase = await verifyAdmin();
    const { error } = await supabase.from("enquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/enquiries");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update enquiry:", errorMessage(error));
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteEnquiryAction(id: string) {
  try {
    const supabase = await verifyAdmin();
    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/enquiries");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete enquiry:", errorMessage(error));
    return { success: false, error: errorMessage(error) };
  }
}
