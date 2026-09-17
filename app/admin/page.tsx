import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getProperties } from "@/lib/properties/service";
import { getAdminDashboardEnquiryStats } from "@/lib/enquiries/service";
import { getEnquiryStatusClass } from "@/lib/statusStyles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ recent: enquiries, total: enquiryTotal, newCount }, properties] = await Promise.all([
    getAdminDashboardEnquiryStats(),
    getProperties(),
  ]);

  const metricCards = [
    { label: "Total properties", value: properties.length },
    { label: "Available properties", value: properties.filter((property) => property.status === "Available").length },
    { label: "Sold properties", value: properties.filter((property) => property.status === "Sold").length },
    { label: "New enquiries", value: newCount },
  ];

  return <div className="min-h-screen bg-slate-100 md:flex"><AdminSidebar /><main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-slate-600">Overview</p><h1 className="mt-1 text-3xl font-extrabold text-slate-950">Dashboard</h1><p className="mt-2 text-slate-600">A quick view of your property business.</p></div><Link href="/admin/properties" className="button-primary w-full sm:w-fit">Add new property</Link></div><section aria-label="Property overview" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map((card) => <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-600">{card.label}</p><p className="mt-3 text-3xl font-extrabold text-slate-950">{card.value}</p></div>)}</section><section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-extrabold text-slate-950">Recent enquiries</h2><p className="mt-1 text-sm text-slate-600"></p></div><span className="text-sm font-semibold text-slate-500">{enquiryTotal} total</span></div><div className="overflow-x-auto"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th scope="col" className="p-4">Name</th><th scope="col" className="p-4">Property</th><th scope="col" className="p-4">Contact</th><th scope="col" className="p-4">Status</th></tr></thead><tbody>{enquiries.map((enquiry) => <tr key={enquiry.id} className="border-t border-slate-100"><td className="p-4 font-bold text-slate-950">{enquiry.name}</td><td className="p-4 text-slate-700">{enquiry.propertyTitle}</td><td className="p-4 text-slate-600">{enquiry.phone || enquiry.email || "No contact"}</td><td className="p-4"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getEnquiryStatusClass(enquiry.status)}`}><span aria-hidden="true">{enquiry.status === "New" ? "●" : "■"}</span>{enquiry.status}</span></td></tr>)}</tbody></table>{enquiries.length === 0 && <p className="p-10 text-center text-slate-600">No enquiries yet.</p>}</div></section></main></div>;
}
