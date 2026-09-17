import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBusinessSettingsForm } from "@/components/admin/AdminBusinessSettingsForm";
import { AdminSecurityForm } from "@/components/admin/AdminSecurityForm";
import { getBusinessSettings } from "@/lib/settings/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings | Fauji Properties",
  description: "Manage Fauji Properties business information.",
};

export default async function AdminSettingsPage() {
  const settings = await getBusinessSettings();

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-slate-600">Admin settings</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Settings</h1>
          <p className="mt-2 text-slate-600">Keep your public business details accurate and up to date.</p>
          <div className="mt-8">
            <AdminBusinessSettingsForm settings={settings} />
            <AdminSecurityForm />
          </div>
        </div>
      </main>
    </div>
  );
}