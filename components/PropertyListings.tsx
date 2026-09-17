"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Property } from "@/lib/properties/types";
import { PropertyGrid } from "./PropertyGrid";

type Budget = "" | "under-50" | "50-75" | "75-plus";

function matchesBudget(priceLakhs: number, budget: Budget) {
  if (budget === "under-50") return priceLakhs < 50;
  if (budget === "50-75") return priceLakhs >= 50 && priceLakhs <= 75;
  if (budget === "75-plus") return priceLakhs > 75;
  return true;
}

function numericArea(area: string) {
  const value = Number.parseFloat(area.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : null;
}

export function PropertyListings({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("location") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [budget, setBudget] = useState<Budget>((searchParams.get("budget") as Budget) ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") ?? "");
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "");

  const visibleProperties = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    const minimumPrice = Number.parseFloat(minPrice);
    const maximumPrice = Number.parseFloat(maxPrice);
    const minimumArea = Number.parseFloat(minArea);
    const maximumArea = Number.parseFloat(maxArea);
    const minimumBedrooms = Number.parseInt(bedrooms, 10);

    return properties.filter((property) => {
      const area = numericArea(property.area);
      const matchesKeyword = !query || `${property.title} ${property.location} ${property.city}`.toLowerCase().includes(query);
      const matchesPrice = (!Number.isFinite(minimumPrice) || property.priceLakhs >= minimumPrice) && (!Number.isFinite(maximumPrice) || property.priceLakhs <= maximumPrice);
      const matchesArea = (!Number.isFinite(minimumArea) || (area !== null && area >= minimumArea)) && (!Number.isFinite(maximumArea) || (area !== null && area <= maximumArea));
      const matchesBedrooms = !Number.isFinite(minimumBedrooms) || (property.bedrooms !== null && property.bedrooms >= minimumBedrooms);
      return matchesKeyword && (!type || property.type === type) && (!status || property.status === status) && matchesBudget(property.priceLakhs, budget) && matchesPrice && matchesArea && matchesBedrooms;
    });
  }, [bedrooms, budget, keyword, maxArea, maxPrice, minArea, minPrice, properties, status, type]);

  const hasFilters = Boolean(keyword || type || status || budget || minPrice || maxPrice || minArea || maxArea || bedrooms);
  function clearFilters() {
    setKeyword(""); setType(""); setStatus(""); setBudget(""); setMinPrice(""); setMaxPrice(""); setMinArea(""); setMaxArea(""); setBedrooms("");
  }

  const filterControls = <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Search title, location, or city<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="e.g. Hyderabad" className="filter-input" /></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Property type<select value={type} onChange={(event) => setType(event.target.value)} className="filter-input"><option value="">All types</option><option>Villa</option><option>Apartment</option><option>House</option><option>Commercial</option><option>Plot</option><option>Land</option></select></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="filter-input"><option value="">All statuses</option><option>Available</option><option>Reserved</option><option>Sold</option></select></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Budget<select value={budget} onChange={(event) => setBudget(event.target.value as Budget)} className="filter-input"><option value="">Any budget</option><option value="under-50">Under ₹50 Lakhs</option><option value="50-75">₹50–75 Lakhs</option><option value="75-plus">₹75 Lakhs+</option></select></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Min price (₹ Lakhs)<input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="e.g. 40" className="filter-input" /></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Max price (₹ Lakhs)<input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="e.g. 150" className="filter-input" /></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Min area (sq. ft.)<input type="number" min="0" value={minArea} onChange={(event) => setMinArea(event.target.value)} placeholder="e.g. 1000" className="filter-input" /></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Max area (sq. ft.)<input type="number" min="0" value={maxArea} onChange={(event) => setMaxArea(event.target.value)} placeholder="e.g. 3000" className="filter-input" /></label>
    <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">Bedrooms (minimum)<input type="number" min="0" value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} placeholder="e.g. 3" className="filter-input" /></label>
  </div>;

  return <>
    <section className="mt-10 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_6px_20px_rgb(23_43_45_/_5%)]">
      <details className="md:hidden"><summary className="cursor-pointer list-none text-base font-extrabold text-[var(--brand-dark)]">Filter properties</summary><div className="mt-5">{filterControls}</div></details>
      <div className="hidden md:block">{filterControls}</div>
    </section>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><p className="text-sm font-medium text-slate-600"><span className="font-extrabold text-[var(--brand-dark)]">{visibleProperties.length}</span> {visibleProperties.length === 1 ? "property" : "properties"} found</p>{hasFilters && <button type="button" onClick={clearFilters} className="text-sm font-bold text-[var(--brand)] underline underline-offset-4 hover:text-[var(--brand-dark)]">Clear filters</button>}</div>
    <section className="mt-6">{visibleProperties.length ? <PropertyGrid properties={visibleProperties} /> : <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white px-6 py-16 text-center"><p className="text-xl font-extrabold text-[var(--brand-dark)]">No properties found</p><p className="mx-auto mt-3 max-w-md text-slate-600">Try widening your search or clearing the filters to browse all listings.</p><button type="button" onClick={clearFilters} className="button-secondary mt-6">Show all properties</button></div>}</section>
  </>;
}
