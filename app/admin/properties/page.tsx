import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminPropertiesClient } from "@/components/admin/AdminPropertiesClient";
import { getProperties } from "@/lib/properties/service";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function AdminPropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden p-5 sm:p-8 lg:p-10">
        <AdminPropertiesClient properties={properties} />
      </main>
    </div>
  );
}
