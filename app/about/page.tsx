import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getPublicBusinessSettings } from "@/lib/settings/service";

export const metadata: Metadata = { title: "About Fauji Properties", description: "Learn how Fauji Properties helps families and investors find homes, plots, and property opportunities in Ambala." };

export default async function AboutPage() {
  const settings = await getPublicBusinessSettings();
  return <><Header settings={settings} /><main id="main-content" className="site-container flex-1 py-16 sm:py-20"><p className="eyebrow">About {settings.name}</p><h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-5xl">Straight forward property guidance for confident decisions.</h1><div className="mt-8 grid gap-10 text-lg leading-8 text-[var(--muted)] lg:grid-cols-[1.1fr_0.9fr]"><div><p>{settings.description}</p><p className="mt-5">From the first conversation to the site visit, our approach is simple: listen carefully, explain plainly, and help you choose a property that fits your plans.</p></div><div className="rounded-2xl bg-[#eaf2ee] p-7"><p className="eyebrow">What we value</p><ul className="mt-5 grid gap-3 text-base font-bold text-[var(--brand-dark)]"><li>Clear property information</li><li>Respectful, responsive guidance</li><li>Long-term relationships</li></ul></div></div></main><Footer settings={settings} /></>;
}
