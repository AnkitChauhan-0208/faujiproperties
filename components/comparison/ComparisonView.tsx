"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getPropertyImageUrls, type Property } from "@/lib/properties/types";
import { getPropertyStatusClass } from "@/lib/statusStyles";
import { ComparisonEmptyState } from "./ComparisonEmptyState";
import { useComparison } from "./useComparison";

type ComparisonRow = {
  label: string;
  value: (property: Property) => string | number | null | undefined;
  tone?: "status";
};

type ComparisonSection = { label: string; rows: ComparisonRow[] };

const comparisonSections: ComparisonSection[] = [
  {
    label: "Basic Information",
    rows: [
      { label: "Price", value: (property) => property.price },
      { label: "Property Type", value: (property) => property.type },
      { label: "Status", value: (property) => property.status, tone: "status" },
    ],
  },
  {
    label: "Property Details",
    rows: [
      { label: "Area", value: (property) => property.area },
      { label: "Bedrooms", value: (property) => property.bedrooms },
      { label: "Bathrooms", value: (property) => property.bathrooms },
      { label: "Facing", value: (property) => property.facing },
      { label: "Dimensions", value: (property) => property.dimensions },
      { label: "Parking", value: (property) => property.parking },
    ],
  },
  {
    label: "Location",
    rows: [{ label: "Location", value: (property) => [property.location, property.city, property.state].filter(Boolean).join(", ") }],
  },
  {
    label: "Features",
    rows: [
      { label: "Amenities", value: (property) => property.amenities.join(", ") },
      { label: "Description", value: (property) => property.description },
    ],
  },
];

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function valuesDiffer(values: Array<string | number | null | undefined>) {
  return new Set(values.map((value) => displayValue(value).trim().toLocaleLowerCase())).size > 1;
}

function PropertyHeader({ property, onRemove }: { property: Property; onRemove: () => void }) {
  const imageUrls = getPropertyImageUrls(property);
  const [imageIndex, setImageIndex] = useState(0);
  const location = [property.location, property.city].filter(Boolean).join(", ");
  const cover = imageUrls[imageIndex];

  return (
    <div className="p-3 sm:p-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={`View of ${property.title}`}
            fill
            sizes="272px"
            className="object-cover"
            loading="eager"
            onError={() => setImageIndex((currentIndex) => currentIndex + 1)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-wide text-slate-400">No photo</div>
        )}
      </div>
      <p className="mt-3 break-words text-base font-extrabold leading-5 text-[var(--brand-dark)]">{property.title}</p>
      {location ? <p className="mt-1 break-words text-xs font-medium text-slate-500">{location}</p> : null}
      <p className="mt-2 text-lg font-extrabold tracking-tight text-[var(--brand)]">{property.price}</p>
      <div className="mt-3 grid gap-2">
        <Link href={`/properties/${property.slug}`} className="button-primary !min-h-9 !px-3 !py-2 text-xs">View Property</Link>
        <button type="button" onClick={onRemove} aria-label={`Remove ${property.title} from comparison`} className="button-secondary !min-h-9 !px-3 !py-2 text-xs text-[#9a4034] hover:bg-[#fff6f3]">Remove</button>
      </div>
    </div>
  );
}

function ComparisonCell({ row, value, differs }: { row: ComparisonRow; value: string | number | null | undefined; differs: boolean }) {
  const content = displayValue(value);
  const cellClass = `border-b border-[var(--line)] px-4 py-4 align-top text-sm leading-6 text-slate-700 transition-colors sm:px-5 ${differs ? "bg-[#f4f9f6]" : "bg-white"} hover:bg-[#edf6f1]`;

  return (
    <td className={cellClass}>
      {row.tone === "status" && content !== "—" ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getPropertyStatusClass(content)}`}>{content}</span> : <span className={content === "—" ? "text-slate-400" : undefined}>{content}</span>}
    </td>
  );
}

export function ComparisonView() {
  const { selectedIds, selectedProperties, isHydrated, status, removeProperty, clearAll, refresh } = useComparison();
  const [hasScrolledComparison, setHasScrolledComparison] = useState(false);
  const isLoading = !isHydrated || (selectedIds.length > 0 && status === "loading" && selectedProperties.length === 0);
  const tableMinWidth = `${9 + selectedProperties.length * 17}rem`;

  if (isLoading) return <main id="main-content" className="site-container flex-1 py-20"><div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white p-8 text-center sm:p-12"><div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-[var(--brand)] border-r-transparent" aria-hidden="true" /><p className="mt-4 text-lg font-bold text-[var(--brand-dark)]">Loading comparison...</p><p className="mt-2 text-sm text-slate-600">Restoring your selected properties.</p></div></main>;

  if (status === "error" && selectedIds.length > 0 && selectedProperties.length === 0) {
    return <main id="main-content" className="site-container flex-1 py-20"><div className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white p-8 text-center sm:p-12"><h1 className="text-3xl font-extrabold text-[var(--brand-dark)]">Unable to load properties</h1><p className="mt-4 text-slate-600">We could not load the listings saved for comparison. They may be unavailable, or the connection failed.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><button type="button" onClick={refresh} className="button-primary">Try again</button><Link href="/properties" className="button-secondary">Browse Properties</Link></div></div></main>;
  }

  if (!selectedIds.length) return <main id="main-content" className="site-container flex-1 py-20"><ComparisonEmptyState /></main>;

  return (
    <main id="main-content" className="site-container min-w-0 flex-1 overflow-x-clip py-8 pb-36 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Compare Properties</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-4xl">Compare Properties</h1><p className="mt-2 text-sm text-slate-600 sm:text-base">Compare up to 3 properties side by side.</p></div>
        <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#e8f1ed] px-3 py-1.5 text-xs font-bold text-[var(--brand-dark)]">{selectedProperties.length} of 3 selected</span>{selectedProperties.length < 3 ? <Link href="/properties" className="button-secondary !min-h-10 !px-3.5 !py-2 text-xs sm:text-sm">+ Add property</Link> : null}<button type="button" onClick={clearAll} className="button-secondary !min-h-10 !px-3.5 !py-2 text-xs text-[#9a4034] hover:bg-[#fff6f3] sm:text-sm">Clear all</button></div>
      </div>

      <section aria-label="Property comparison table" className="mt-8 min-w-0 rounded-2xl border border-[var(--line)] bg-white shadow-[0_12px_32px_rgb(23_43_45_/_6%)]">
        <div className="flex items-center justify-end border-b border-[var(--line)] bg-[#f8fbf9] px-4 py-2 sm:hidden">
          <p aria-live="polite" className={`text-xs font-semibold text-slate-500 transition-opacity ${hasScrolledComparison ? "opacity-40" : "opacity-100"}`}>Swipe to compare →</p>
        </div>
        <div
          data-comparison-scroll
          className="min-w-0 overflow-x-auto overscroll-x-contain"
          onScroll={(event) => {
            if (event.currentTarget.scrollLeft > 4 && !hasScrolledComparison) setHasScrolledComparison(true);
          }}
        >
        <table className="w-full table-fixed border-collapse text-left" style={{ minWidth: tableMinWidth }}>
          <caption className="sr-only">Compare selected property attributes side by side</caption>
          <thead className="bg-[#f8fbf9]"><tr><th scope="col" className="sticky left-0 z-30 w-36 min-w-36 border-b border-r border-[var(--line)] bg-[#f8fbf9] px-4 py-5 align-bottom text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-dark)] shadow-[5px_0_9px_-7px_rgb(21_56_57_/_55%)] sm:px-5">Property Attribute</th>{selectedProperties.map((property) => <th key={property.id} scope="col" className="min-w-[17rem] border-b border-[var(--line)] align-top"><PropertyHeader key={`${property.id}:${getPropertyImageUrls(property).join("|")}`} property={property} onRemove={() => removeProperty(property.id)} /></th>)}</tr></thead>
          {comparisonSections.map((section) => <tbody key={section.label}><tr><th scope="colgroup" className="sticky left-0 z-[25] min-w-36 border-y border-r border-[var(--line)] bg-[#eaf3ee] px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-dark)] shadow-[5px_0_9px_-7px_rgb(21_56_57_/_55%)] sm:px-5">{section.label}</th><td colSpan={selectedProperties.length} className="border-y border-[var(--line)] bg-[#eaf3ee]" /></tr>{section.rows.map((row) => {
            const values = selectedProperties.map(row.value);
            const differs = valuesDiffer(values);
            return <tr key={row.label} className="group"><th scope="row" className="sticky left-0 z-20 min-w-36 border-b border-r border-[var(--line)] bg-slate-50 px-4 py-4 align-top text-sm font-bold text-[var(--brand-dark)] shadow-[5px_0_9px_-7px_rgb(21_56_57_/_55%)] transition-colors group-hover:bg-[#f1f6f3] sm:px-5">{row.label}</th>{values.map((value, index) => <ComparisonCell key={selectedProperties[index].id} row={row} value={value} differs={differs} />)}</tr>;
          })}</tbody>)}
        </table>
        </div>
      </section>
    </main>
  );
}
