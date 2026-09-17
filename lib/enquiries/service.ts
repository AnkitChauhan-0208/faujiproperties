import { createAuthorizedAdminClient } from "@/lib/supabase/server";

export async function getAdminEnquiries() {
  const supabase = await createAuthorizedAdminClient();
  const { data, error } = await supabase.from("enquiries").select("id, name, phone, email, message, status, created_at, properties(title)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  type EnquiryRow = { id: string; name: string; phone: string; email: string | null; message: string; status: string; created_at: string; properties: { title: string } | { title: string }[] | null };
  return ((data || []) as unknown as EnquiryRow[]).map((enquiry) => ({
    id: enquiry.id,
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    message: enquiry.message,
    status: enquiry.status,
    createdAt: enquiry.created_at,
    propertyTitle: Array.isArray(enquiry.properties) ? enquiry.properties[0]?.title || "Unknown property" : enquiry.properties?.title || "Unknown property",
  }));
}

export async function getAdminDashboardEnquiryStats() {
  const supabase = await createAuthorizedAdminClient();
  const [recentResult, totalResult, newResult] = await Promise.all([
    supabase
      .from("enquiries")
      .select("id, name, phone, email, status, created_at, properties(title)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "New"),
  ]);

  const error = recentResult.error || totalResult.error || newResult.error;
  if (error) throw new Error(error.message);

  type EnquiryRow = { id: string; name: string; phone: string; email: string | null; status: string; created_at: string; properties: { title: string } | { title: string }[] | null };
  const recent = ((recentResult.data || []) as unknown as EnquiryRow[]).map((enquiry) => ({
    id: enquiry.id,
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    status: enquiry.status,
    createdAt: enquiry.created_at,
    propertyTitle: Array.isArray(enquiry.properties) ? enquiry.properties[0]?.title || "Unknown property" : enquiry.properties?.title || "Unknown property",
  }));

  return { recent, total: totalResult.count || 0, newCount: newResult.count || 0 };
}
