"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Property } from "@/lib/properties/types";
import { getPropertyStatusClass } from "@/lib/statusStyles";
import { SavePropertyButton } from "./SavePropertyButton";
import { CompareButton } from "./comparison/CompareButton";

export function PropertyCard({ property }: { property: Property }) {
  const pathname = usePathname();
  const coverImage = property.images?.[0];
  const propertyHref = `/properties/${property.slug}?from=${encodeURIComponent(pathname)}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_5px_18px_rgb(23_43_45_/_5%)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgb(23_43_45_/_10%)]">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${property.title} cover`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#e6f0ec,#f9f3e8)] text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            No image
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getPropertyStatusClass(property.status)}`}><span aria-hidden="true" className="mr-1">{property.status === "Available" ? "●" : "■"}</span>{property.status}</p>
          <div className="flex items-center gap-2"><CompareButton property={property} /><SavePropertyButton propertyId={property.id} compact /></div>
        </div>
        <h3 className="mt-4 text-xl font-bold text-[var(--brand-dark)]">{property.title}</h3>
        <p className="mt-1 text-slate-600">{property.location}</p>
        <div className="mt-6 border-t border-[var(--line)] pt-4"><p className="text-xl font-extrabold text-[var(--brand-dark)]">{property.price}</p><p className="mt-1 text-sm text-slate-600">{property.area} · {property.type}</p></div>
        <Link href={propertyHref} className="mt-5 inline-flex min-h-12 items-center text-sm font-bold text-[var(--brand)] group-hover:text-[var(--brand-dark)]">View property <span aria-hidden="true" className="ml-1">→</span></Link>
      </div>
    </article>
  );
}
