import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyListings } from "@/components/PropertyListings";
import { getProperties } from "@/lib/properties/service";
import { getPublicBusinessSettings } from "@/lib/settings/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Properties for Sale in Hyderabad", description: "Browse homes, apartments, and plots for sale in Hyderabad with Fauji Properties." };

export default async function PropertiesPage() {
  const [properties, settings] = await Promise.all([getProperties(), getPublicBusinessSettings()]);
  
  return <><Header settings={settings} /><main className="site-container flex-1 py-16"><p className="eyebrow">Available listings</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--brand-dark)]">Properties for sale</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">Browse our currently available homes, plots, and investments.</p><Suspense fallback={<p className="mt-10 text-slate-600">Loading properties…</p>}><PropertyListings properties={properties} /></Suspense></main><Footer settings={settings} /></>;
}
