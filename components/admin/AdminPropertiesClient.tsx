"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminPropertyForm } from "./AdminPropertyForm";
import type { Property } from "@/lib/properties/types";
import { deletePropertyAction } from "@/lib/properties/actions";
import { getPropertyStatusClass } from "@/lib/statusStyles";

export function AdminPropertiesClient({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addParamOpen = searchParams.get("add") === "1";
  const editingPropertyId = searchParams.get("edit");
  const editingProperty = properties.find((property) => property.id === editingPropertyId) ?? null;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters and Sorting
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFeatured, setFilterFeatured] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const showForm = addParamOpen || editingProperty !== null;

  const visibleProperties = useMemo(() => {
    let result = [...properties];

    // Filtering
    const search = query.trim().toLowerCase();
    if (search) {
      result = result.filter((property) => `${property.title} ${property.location} ${property.city} ${property.type}`.toLowerCase().includes(search));
    }
    if (filterType !== "All") {
      result = result.filter((property) => property.type === filterType);
    }
    if (filterStatus !== "All") {
      result = result.filter((property) => property.status === filterStatus);
    }
    if (filterFeatured !== "All") {
      const isFeatured = filterFeatured === "Yes";
      result = result.filter((property) => property.featured === isFeatured);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === "Oldest") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (sortBy === "Price: Low to High") return a.priceLakhs - b.priceLakhs;
      if (sortBy === "Price: High to Low") return b.priceLakhs - a.priceLakhs;
      return 0;
    });

    return result;
  }, [properties, query, filterType, filterStatus, filterFeatured, sortBy]);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete Property?\n\nAre you sure you want to permanently delete\n"${title}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    const result = await deletePropertyAction(id);
    setDeletingId(null);
    if (result.success) {
      window.alert("Property deleted successfully.");
      router.refresh();
    } else {
      window.alert(`Unable to delete property. ${result.error}`);
    }
  }

  function handleEdit(property: Property) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("add");
    params.set("edit", property.id);
    const nextUrl = params.toString() ? `/admin/properties?${params.toString()}` : "/admin/properties";
    router.replace(nextUrl, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAdd() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("edit");
    if (addParamOpen) {
      params.delete("add");
    } else {
      params.set("add", "1");
    }

    const nextUrl = params.toString() ? `/admin/properties?${params.toString()}` : "/admin/properties";
    router.replace(nextUrl, { scroll: false });
  }

  function handleFormSuccess() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("add");
    params.delete("edit");
    const nextUrl = params.toString() ? `/admin/properties?${params.toString()}` : "/admin/properties";
    router.replace(nextUrl, { scroll: false });
  }

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">Inventory</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Properties</h1>
          <p className="mt-2 text-slate-600">Review and manage your current listings.</p>
        </div>
        <button type="button" onClick={handleAdd} className="button-primary w-full sm:w-fit">
          {addParamOpen ? "Close form" : "+ Add Property"}
        </button>
      </div>

      {showForm && (
        <section className="mt-8 min-w-0 max-w-full">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-slate-950">
              {editingProperty ? "Edit property" : "Add new property"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {editingProperty ? "Update the details of the selected property." : "Fill out the details to add a property to the database."}
            </p>
          </div>
          <AdminPropertyForm initialData={editingProperty} onSuccess={handleFormSuccess} />
        </section>
      )}

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">All properties</h2>
            <p className="mt-1 text-sm text-slate-600">{visibleProperties.length} of {properties.length} listings shown</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-10 w-full rounded-lg border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[#d9e8e3] sm:w-48" placeholder="Search..." />

            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]">
              <option value="All">All Types</option>
              <option value="Land">Land</option>
              <option value="Villa">Villa</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
              <option value="Plot">Plot</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]">
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>

            <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]">
              <option value="All">Any Featured</option>
              <option value="Yes">Featured</option>
              <option value="No">Not Featured</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--brand)]">
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[54rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="p-4">Property</th>
                <th scope="col" className="p-4">Price</th>
                <th scope="col" className="p-4">Type</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4">Featured</th>
                <th scope="col" className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProperties.map((property) => (
                <tr key={property.id} className="border-t border-slate-100 transition hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-950">{property.title}</p>
                    <p className="mt-1 text-slate-500">{property.location}, {property.city}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{property.price}</td>
                  <td className="p-4 text-slate-600">{property.type}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getPropertyStatusClass(property.status)}`}>
                      <span aria-hidden="true">{property.status === "Available" ? "●" : property.status === "Reserved" ? "◓" : "■"}</span>
                      {property.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {property.featured ? <span className="font-bold text-yellow-600">★ Yes</span> : <span className="text-slate-400">No</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/properties/${property.slug}`} target="_blank" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 font-bold text-slate-700 hover:border-slate-400">
                        View
                      </Link>
                      <button type="button" onClick={() => handleEdit(property)} className="min-h-10 rounded-lg border border-[var(--line)] px-3 font-bold text-[var(--brand-dark)] hover:border-[var(--brand)]">
                        Edit
                      </button>
                      <button type="button" disabled={deletingId === property.id} onClick={() => handleDelete(property.id, property.title)} className="min-h-10 rounded-lg border border-[#e4c7c1] px-3 font-bold text-[#9a4034] hover:bg-[#fff6f3] disabled:opacity-50 disabled:cursor-not-allowed">
                        {deletingId === property.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleProperties.length === 0 && <div className="p-10 text-center"><p className="text-lg font-bold text-slate-900">No properties match your search.</p><p className="mt-2 text-slate-600">Try adjusting your filters or search term.</p></div>}
        </div>
      </section>
    </>
  );
}
