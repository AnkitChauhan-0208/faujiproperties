"use client";

import { useActionState, useRef } from "react";
import { updateBusinessSettingsAction } from "@/lib/settings/actions";
import type { BusinessSettings } from "@/lib/settings/service";

const inputClass = "min-h-12 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d9e8e3]";

export function AdminBusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  const formRef = useRef<HTMLFormElement>(null);
  const savedValuesRef = useRef({
    name: settings.name,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    mapsUrl: settings.mapsUrl,
    description: settings.description,
    notificationEnabled: settings.notificationEnabled,
  });
  const [state, formAction, isPending] = useActionState(async (previousState: { success: boolean; error?: string }, formData: FormData) => {
    const result = await updateBusinessSettingsAction(previousState, formData);
    if (result.success) {
      savedValuesRef.current = {
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        whatsapp: String(formData.get("whatsapp") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
        mapsUrl: String(formData.get("mapsUrl") ?? ""),
        description: String(formData.get("description") ?? ""),
        notificationEnabled: formData.get("notificationEnabled") === "on",
      };
    }
    return result;
  }, { success: false, error: "" });

  function cancelChanges() {
    const form = formRef.current;
    if (!form) return;
    for (const [name, value] of Object.entries(savedValuesRef.current)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        field.defaultChecked = value === true;
      } else if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.defaultValue = String(value);
      }
    }
    form.reset();
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgb(23_43_45_/_5%)] sm:p-6">
      <div className="grid gap-1 border-b border-slate-100 pb-5">
        <h2 className="text-xl font-extrabold text-slate-950">Business Information</h2>
        <p className="text-sm text-slate-600">Manage the contact details shown across your property business.</p>
      </div>

      {state.success && <p role="status" className="rounded-lg border border-[#b7d8c8] bg-[#f0faf4] px-4 py-3 text-sm font-bold text-[#246044]">Business information saved successfully.</p>}
      {state.error && <p role="alert" className="rounded-lg border border-[#e4c7c1] bg-[#fff6f3] px-4 py-3 text-sm font-bold text-[#9a4034]">{state.error}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Business / brand name<input required name="name" defaultValue={settings.name} className={inputClass} /></label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Business phone number<input name="phone" type="tel" defaultValue={settings.phone} className={inputClass} /></label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">WhatsApp number<input name="whatsapp" type="tel" defaultValue={settings.whatsapp} className={inputClass} /></label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Business email<input name="email" type="email" defaultValue={settings.email} className={inputClass} /></label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Office address<textarea name="address" defaultValue={settings.address} rows={3} className={`${inputClass} py-3`} /></label>
      <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Google Maps URL<input name="mapsUrl" type="url" defaultValue={settings.mapsUrl} placeholder="https://maps.google.com/..." className={inputClass} /></label>
      <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Short business description<textarea name="description" defaultValue={settings.description} rows={4} maxLength={500} className={`${inputClass} py-3`} /></label>
      <label className="flex items-center gap-3 text-sm font-bold text-[var(--brand-dark)]"><input type="checkbox" name="notificationEnabled" defaultChecked={settings.notificationEnabled} className="size-4" />Notifications enabled for new enquiries</label>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={cancelChanges} className="button-secondary w-full sm:w-fit">Cancel</button>
        <button type="submit" disabled={isPending} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit">{isPending ? "Saving..." : "Save changes"}</button>
      </div>
    </form>
  );
}