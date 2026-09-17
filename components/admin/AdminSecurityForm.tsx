"use client";

import { useActionState, useEffect, useRef } from "react";
import { changeAdminPasswordAction } from "@/lib/settings/actions";

const inputClass = "min-h-12 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d9e8e3]";
const initialState = { success: false, error: "" };

export function AdminSecurityForm() {
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const [passwordState, passwordAction, passwordPending] = useActionState(changeAdminPasswordAction, initialState);

  useEffect(() => {
    if (passwordState.success) passwordFormRef.current?.reset();
  }, [passwordState.success]);

  return (
    <section className="mt-8 grid gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgb(23_43_45_/_5%)] sm:p-6">
      <div className="grid gap-1 border-b border-slate-100 pb-5">
        <h2 className="text-xl font-extrabold text-slate-950">Admin &amp; Security</h2>
        <p className="text-sm text-slate-600">Update the credentials used to protect your admin account.</p>
      </div>

      <div className="grid gap-4 border-b border-slate-100 pb-6">
        <div><h3 className="font-extrabold text-slate-950">Change admin password</h3><p className="mt-1 text-sm text-slate-600">Use at least 8 characters. Your current session stays active.</p></div>
        <form ref={passwordFormRef} action={passwordAction} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">New password<input required minLength={8} name="password" type="password" autoComplete="new-password" className={inputClass} /></label>
          <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Confirm new password<input required minLength={8} name="passwordConfirmation" type="password" autoComplete="new-password" className={inputClass} /></label>
          <div className="sm:col-span-2">
            {passwordState.success && <p role="status" className="text-sm font-bold text-[#246044]">Password changed successfully.</p>}
            {passwordState.error && <p role="alert" className="text-sm font-bold text-[#9a4034]">{passwordState.error}</p>}
          </div>
          <button type="submit" disabled={passwordPending} className="button-primary w-full disabled:opacity-60 sm:w-fit">{passwordPending ? "Updating..." : "Change password"}</button>
        </form>
      </div>

    </section>
  );
}