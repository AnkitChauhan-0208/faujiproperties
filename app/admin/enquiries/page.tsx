import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminEnquiriesClient } from "@/components/admin/AdminEnquiriesClient";
import { getAdminEnquiries } from "@/lib/enquiries/service";

export const metadata: Metadata = { title: "Enquiries | Fauji Admin", description: "Review property enquiries in the Fauji Properties admin panel." };

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await getAdminEnquiries();
  return <div className="min-h-screen bg-slate-100 md:flex"><AdminSidebar /><main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><p className="text-sm font-semibold text-slate-600">Inbox</p><h1 className="mt-1 text-3xl font-extrabold text-slate-950">Enquiries</h1><p className="mt-2 text-slate-600">Review and manage customer enquiries.</p><AdminEnquiriesClient enquiries={enquiries} /></main></div>;
}
