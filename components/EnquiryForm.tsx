"use client";

import { useActionState, useState } from "react";
import { createEnquiryAction } from "@/lib/enquiries/actions";

const inputClass = "min-h-12 rounded-lg border border-[var(--line)] px-3 font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d9e8e3]";

export function EnquiryForm({ propertyId }: { propertyId?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, isPending] = useActionState(async (_previous: { success: boolean; error?: string }, formData: FormData) => {
    const result = await createEnquiryAction(formData);
    if (result.success) setSubmitted(true);
    return result;
  }, { success: false, error: "" });

  if (submitted) {
    return <div className="rounded-2xl border border-[#b9d9c9] bg-[#eef8f2] p-6"><p className="text-lg font-extrabold text-[var(--brand-dark)]">Thank you for your enquiry.</p><p className="mt-2 text-slate-600">Our team will contact you soon.</p><button type="button" onClick={() => setSubmitted(false)} className="mt-5 text-sm font-bold text-[var(--brand)] underline underline-offset-4">Send another enquiry</button></div>;
  }

  return <form action={formAction} className="grid gap-5 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_12px_30px_rgb(23_43_45_/_6%)]">{propertyId && <input type="hidden" name="propertyId" value={propertyId} />}<div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Your name<input required name="name" autoComplete="name" className={inputClass} /></label><label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Mobile number<input required name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Enter a 10-digit mobile number" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} className={inputClass} /></label></div><label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Email address <span className="font-normal text-slate-500">(optional)</span><input name="email" type="email" autoComplete="email" className={inputClass} /></label><label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Message<textarea required name="message" rows={4} className="rounded-lg border border-[var(--line)] p-3 font-normal outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d9e8e3]" placeholder="Tell us what you are looking for." /></label>{state.error && <p className="text-sm font-bold text-[#9a4034]">{state.error}</p>}<button type="submit" disabled={isPending} className="button-primary w-full disabled:cursor-wait disabled:opacity-60">{isPending ? "Sending..." : "Send enquiry"}</button></form>;
}
