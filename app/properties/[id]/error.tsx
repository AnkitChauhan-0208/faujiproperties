"use client";

export default function PropertyDetailError({ reset }: { reset: () => void }) {
  return (
    <main className="site-container flex min-h-[60vh] flex-col items-start justify-center py-16">
      <p className="eyebrow">Fauji Properties</p>
      <h1 className="mt-3 text-4xl font-extrabold text-[var(--brand-dark)]">Unable to load this property</h1>
      <p className="mt-4 max-w-lg text-lg leading-8 text-[var(--muted)]">Please try again later.</p>
      <button type="button" onClick={() => reset()} className="button-primary mt-8">Try again</button>
    </main>
  );
}