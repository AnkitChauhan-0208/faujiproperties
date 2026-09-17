import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeading } from "@/components/SectionHeading";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getFeaturedProperties } from "@/lib/properties/service";
import { getPublicBusinessSettings } from "@/lib/settings/service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredProperties, settings] = await Promise.all([getFeaturedProperties(), getPublicBusinessSettings()]);

  return (
    <>
      <Header settings={settings} />
      <main id="main-content" className="flex-1">
        <section className="site-container grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="eyebrow">Homes · Plots · Investments</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-5xl lg:text-6xl">Find a property you&apos;ll be proud to own.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">{settings.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/properties" className="button-primary">Explore Properties</Link>
              <Link href="/contact" className="button-secondary">Speak with our team</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#d2dfda] bg-[linear-gradient(145deg,#e6f0ec,#f9f3e8)] p-7 shadow-[0_20px_60px_rgb(31_77_78_/_12%)] sm:p-10">
            <p className="eyebrow">Your next address</p>
            <p className="mt-5 text-3xl font-bold tracking-tight text-[var(--brand-dark)]">Clear choices. Trusted guidance.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/90 p-4"><span className="block text-2xl font-bold text-[var(--brand)]">3+</span><span className="mt-1 block text-slate-600">Featured listings</span></div>
              <div className="rounded-xl bg-white/90 p-4"><span className="block text-2xl font-bold text-[var(--brand)]">1:1</span><span className="mt-1 block text-slate-600">Personal support</span></div>
            </div>
          </div>
        </section>
        
        <section className="site-container pb-20"><SearchBar /></section>
        
        {featuredProperties.length > 0 && (
          <section className="border-y border-[var(--line)] bg-white py-20">
            <div className="site-container">
              <SectionHeading eyebrow="Selected for you" title="Featured properties" description={`A small selection of homes and plots currently available with ${settings.name}.`} />
              <div className="mt-10"><PropertyGrid properties={featuredProperties} /></div>
              <Link href="/properties" className="button-secondary mt-8">View all properties</Link>
            </div>
          </section>
        )}
        
        <section className="site-container grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Let&apos;s talk" title="Looking for the right property?" description="Share what you need and our team will guide you through the options." />
          <EnquiryForm />
        </section>
      </main>
      <WhatsAppButton settings={settings} />
      <Footer settings={settings} />
    </>
  );
}
