import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getPublicBusinessSettings } from "@/lib/settings/service";

export const metadata: Metadata = { title: "Contact Fauji Properties", description: "Contact Fauji Properties in Hyderabad by phone, WhatsApp, email, or enquiry form." };

export default async function ContactPage() {
  const settings = await getPublicBusinessSettings();
  return <><Header settings={settings} /><main id="main-content" className="site-container grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow">Contact {settings.name}</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--brand-dark)]">Let&apos;s find your next property.</h1><p className="mt-4 text-lg leading-8 text-[var(--muted)]">{settings.description}</p><div className="mt-8 grid gap-4 rounded-2xl border border-[var(--line)] bg-white p-6 text-sm text-slate-700"><a href={settings.phoneHref} className="font-bold text-[var(--brand)]">Call {settings.phone || "our team"}</a><a href={settings.whatsappHref} target="_blank" rel="noreferrer" className="font-bold text-[var(--brand)]">Message us on WhatsApp</a><a href={`mailto:${settings.email}`} className="font-bold text-[var(--brand)]">{settings.email}</a><p>{settings.address}</p>{settings.mapsUrl && <a href={settings.mapsHref} target="_blank" rel="noreferrer" className="font-bold text-[var(--brand)]">Open in Google Maps</a>}<p><span className="font-bold text-[var(--brand-dark)]">Hours:</span> Monday to Saturday, 9:00 AM to 7:00 PM</p></div></div><EnquiryForm /></main><WhatsAppButton settings={settings} /><Footer settings={settings} /></>;
}
