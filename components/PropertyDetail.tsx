"use client";

import { motion, type Variants } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SavePropertyButton } from "@/components/SavePropertyButton";
import { SectionHeading } from "@/components/SectionHeading";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { Property } from "@/lib/properties/types";
import { getPropertyStatusClass } from "@/lib/statusStyles";
import type { PublicBusinessSettings } from "@/lib/settings/service";

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function PropertyDetail({ property, similarProperties, settings }: { property: Property; similarProperties: Property[]; settings: PublicBusinessSettings }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = searchParams.get("from");
  const propertyUrl = `/properties/${property.slug}`;
  const whatsappMessage = encodeURIComponent(`Hello, I’m interested in this property and would like to know more details about the price, location, and availability.\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\nPrice: ${property.price}\nProperty Link: ${propertyUrl}`);
  const propertyWhatsAppHref = `${settings.whatsappHref}?text=${whatsappMessage}`;
  const facts = [
    { label: "Area", value: property.area },
    { label: "Dimensions", value: property.dimensions ?? "Not specified" },
    { label: "Bedrooms", value: property.bedrooms ? String(property.bedrooms) : "Not applicable" },
    { label: "Bathrooms", value: property.bathrooms ? String(property.bathrooms) : "Not applicable" },
    { label: "Parking", value: property.parking ?? "Not applicable" },
    { label: "Property type", value: property.type },
    { label: "Facing", value: property.facing ?? "Not specified" },
  ];
  
  return <>
    <main className="site-container flex-1 py-10 pb-28 sm:py-14 sm:pb-32">
      <button type="button" onClick={() => returnPath?.startsWith("/") ? router.push(returnPath) : window.history.length > 1 ? router.back() : router.push("/properties")} className="text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-dark)]">← Back</button>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div initial="hidden" animate="visible" variants={reveal}>
          {property.images.length > 0 ? (
            <PropertyGallery images={property.images} title={property.title} />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e6f0ec,#f9f3e8)] px-6 text-center text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
              No property images available
            </div>
          )}
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.1 }} className="lg:pt-4">
          <div className="flex items-center justify-between gap-3"><p className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getPropertyStatusClass(property.status)}`}>{property.status}</p><SavePropertyButton propertyId={property.id} /></div>
          <p className="mt-5 text-sm font-semibold text-slate-500">{property.location}, {property.city}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-5xl">{property.title}</h1>
          <p className="mt-5 text-3xl font-extrabold text-[var(--brand)]">{property.price}</p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">{facts.map((fact) => <div key={fact.label} className="rounded-xl border border-[var(--line)] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{fact.label}</p><p className="mt-1 font-extrabold text-[var(--brand-dark)]">{fact.value}</p></div>)}</div>
          <div className="mt-8"><a href="#enquire" className="button-primary w-full">Enquire now</a></div>
        </motion.div>
      </div>

      <section className="mt-16 grid gap-12 border-t border-[var(--line)] pt-16 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}><SectionHeading eyebrow="About this property" title="A home worth exploring." /><p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] whitespace-pre-wrap">{property.description}</p></motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="rounded-2xl bg-white p-6"><h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Amenities</h2>
        {property.amenities.length > 0 ? (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">{property.amenities.map((amenity) => <li key={amenity} className="flex items-center gap-2 text-sm text-slate-700"><span className="flex size-5 items-center justify-center rounded-full bg-[#e8f1ed] text-xs font-bold text-[var(--brand)]">✓</span>{amenity}</li>)}</ul>
        ) : (
          <p className="mt-5 text-sm text-slate-500">No amenities listed.</p>
        )}
        </motion.div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div><SectionHeading eyebrow="Location" title="Find it in the neighbourhood." /><div className="mt-7 rounded-2xl border border-[var(--line)] bg-white p-6"><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Area / neighbourhood</dt><dd className="mt-1 font-extrabold text-[var(--brand-dark)]">{property.location}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">City</dt><dd className="mt-1 font-extrabold text-[var(--brand-dark)]">{property.city}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">State</dt><dd className="mt-1 font-extrabold text-[var(--brand-dark)]">{property.state}</dd></div></dl></div></div>
        <div><SectionHeading eyebrow="Property status" title="Current availability." /><div className="mt-7 rounded-2xl border border-[var(--line)] bg-white p-6"><p className="text-sm text-[var(--muted)]">This listing is currently marked as</p><p className={`mt-2 text-2xl font-extrabold ${property.status === "Sold" ? "text-[#9a4034]" : "text-[var(--brand)]"}`}>{property.status.toUpperCase()}</p></div></div>
      </section>

      <section id="enquire" className="mt-16 grid gap-10 rounded-2xl bg-[#eaf2ee] p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-12"><div><SectionHeading eyebrow={`Talk to ${settings.name}`} title="A clear answer is one message away." description="Ask about this property, arrange a visit, or get help comparing your options." /><div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col"><a href={settings.phoneHref} className="button-primary">Call {settings.phone || "our team"}</a><a href={propertyWhatsAppHref} target="_blank" rel="noreferrer" className="button-secondary">Message on WhatsApp</a></div></div><EnquiryForm propertyId={property.id} /></section>

      {similarProperties.length > 0 && <section className="mt-16"><SectionHeading eyebrow="You may also like" title="Similar properties" /><div className="mt-8"><PropertyGrid properties={similarProperties} /></div></section>}
    </main>
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-[var(--line)] bg-white/95 p-3 shadow-[0_-8px_24px_rgb(23_43_45_/_10%)] backdrop-blur sm:hidden"><a href={settings.phoneHref} className="button-primary flex-1">Call us</a><a href={propertyWhatsAppHref} target="_blank" rel="noreferrer" className="button-secondary flex-1">WhatsApp</a><a href="#enquire" className="button-secondary flex-1">Enquire</a></div>
    <WhatsAppButton property={property} settings={settings} />
  </>;
}
