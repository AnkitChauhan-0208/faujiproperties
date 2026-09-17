"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEnquiryAction, updateEnquiryStatusAction } from "@/lib/enquiries/actions";
import { getEnquiryStatusClass } from "@/lib/statusStyles";

type Enquiry = { id: string; name: string; phone: string; email: string | null; message: string; status: string; createdAt: string; propertyTitle: string };
const statusOptions = ["New", "Contacted", "Interested", "Closed"] as const;

function formatEnquiryDate(value: string) {
  return new Intl.DateTimeFormat("en-US").format(new Date(value));
}

export function AdminEnquiriesClient({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPending, startTransition] = useTransition();
  const visible = useMemo(() => enquiries.filter((enquiry) => `${enquiry.name} ${enquiry.phone} ${enquiry.email || ""} ${enquiry.propertyTitle}`.toLowerCase().includes(query.trim().toLowerCase()) && (statusFilter === "All" || enquiry.status === statusFilter)), [enquiries, query, statusFilter]);

  function updateStatus(id: string, status: string) {
    startTransition(async () => {
      const result = await updateEnquiryStatusAction(id, status as typeof statusOptions[number]);
      if (!result.success) window.alert(result.error || "Unable to update status.");
    });
  }

  function deleteEnquiry(id: string) {
    if (!window.confirm("Delete this enquiry?\nThis enquiry will be permanently removed.")) return;

    startTransition(async () => {
      const result = await deleteEnquiryAction(id);
      if (!result.success) {
        window.alert(result.error || "Unable to delete enquiry. Please try again.");
        return;
      }

      window.alert("Enquiry deleted successfully.");
      router.refresh();
    });
  }

  return <><div className="mt-8 flex flex-col gap-3 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search enquiries" className="min-h-11 flex-1 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]" /><select suppressHydrationWarning value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]"><option>All</option>{statusOptions.map((status) => <option key={status} className="bg-white text-slate-900">{status}</option>)}</select></div><section className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[74rem] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["Customer", "Contact", "Property", "Message", "Date", "Status", "Action"].map((heading) => <th key={heading} scope="col" className="p-4">{heading}</th>)}</tr></thead><tbody>{visible.map((enquiry) => <tr key={enquiry.id} className="border-t border-slate-100 align-top"><td className="p-4 font-bold text-slate-950">{enquiry.name}</td><td className="p-4 text-slate-600"><a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`} className="font-medium hover:text-[var(--brand)]">{enquiry.phone}</a><br />{enquiry.email || "No email"}</td><td className="p-4 text-slate-700">{enquiry.propertyTitle}</td><td className="max-w-xs whitespace-pre-wrap p-4 text-slate-600">{enquiry.message}</td><td className="whitespace-nowrap p-4 text-slate-600">{formatEnquiryDate(enquiry.createdAt)}</td><td className="p-4"><select suppressHydrationWarning disabled={isPending} value={enquiry.status} onChange={(event) => updateStatus(enquiry.id, event.target.value)} className={`min-h-10 rounded-lg border border-[var(--line)] px-2 text-sm font-bold ${getEnquiryStatusClass(enquiry.status)}`}>{statusOptions.map((status) => <option key={status} className="bg-white text-slate-900">{status}</option>)}</select></td><td className="p-4"><button type="button" disabled={isPending} onClick={() => deleteEnquiry(enquiry.id)} className="min-h-10 w-full rounded-lg border border-[#e4c7c1] px-3 font-bold text-[#9a4034] hover:bg-[#fff6f3] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Delete</button></td></tr>)}</tbody></table>{visible.length === 0 && <p className="p-10 text-center text-slate-600">No enquiries match your filters.</p>}</section></>;
}
