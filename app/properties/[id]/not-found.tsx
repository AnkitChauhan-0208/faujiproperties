import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <main className="site-container flex min-h-[60vh] flex-col items-start justify-center py-16">
      <p className="eyebrow">Fauji Properties</p>
      <h1 className="mt-3 text-4xl font-extrabold text-[var(--brand-dark)]">Property not found</h1>
      <p className="mt-4 max-w-lg text-lg leading-8 text-[var(--muted)]">The property you&apos;re looking for may have been removed or is no longer available.</p>
      <Link href="/properties" className="button-primary mt-8">View all properties</Link>
    </main>
  );
}